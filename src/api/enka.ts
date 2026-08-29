import { LRUCache } from './cache.js';
import { ENKA_PROPERTY_MAP } from '../constants/enka_properties.js';
import {
  HSRInvalidUIDError,
  HSRRateLimitError,
  HSRDataNotFoundError,
  HSRSDKError,
  HSRTimeoutError
} from '../types/errors.js';
import type { EnkaApiResponse } from '../types/api.js';
import type { PlayerProfile, PlayerCharacter, PlayerEquipment, PlayerRelic } from '../types/player.js';
import type { ComputedStats } from '../types/stats.js';
import { createEmptyStats } from '../types/stats.js';
import { SDK_VERSION } from '../version.js';

// 9 digits, no leading zero
const UID_REGEX = /^[1-9]\d{8}$/;
const DEFAULT_PROVIDERS = ['https://enka.network/api/hsr/uid'];
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 15_000;
// exponential backoff: 1s, 2s, 4s
const RETRY_DELAYS = [1000, 2000, 4000];

export interface EnkaClientOptions {
  cacheMaxSize?: number;
  cacheTtlMs?: number;
  timeoutMs?: number;
  maxRetries?: number;
  /** Base URLs to try in order. Each is a full base URL ending before the UID segment. */
  providers?: string[];
}

/**
 * Client for fetching player profiles from Enka.Network.
 * Includes LRU caching, request deduplication, multi-provider fallback, and retry with exponential backoff.
 */
export class EnkaClient {
  private cache: LRUCache<EnkaApiResponse>;
  private pendingRequests = new Map<string, Promise<EnkaApiResponse>>();
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly providers: string[];

  /**
   * @param options - Client configuration (cache size, TTL, timeout, retries, providers).
   */
  constructor(options?: EnkaClientOptions) {
    this.cache = new LRUCache<EnkaApiResponse>(
      options?.cacheMaxSize,
      options?.cacheTtlMs
    );
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.providers = options?.providers?.length
      ? options.providers
      : DEFAULT_PROVIDERS;
  }

  /**
   * Fetches and parses a player profile by UID.
   * @param uid - 9-digit Honkai: Star Rail UID.
   * @throws {@link HSRInvalidUIDError} if the UID format is invalid.
   * @throws {@link HSRDataNotFoundError} if the profile does not exist.
   * @throws {@link HSRRateLimitError} if rate-limited by Enka.Network.
   */
  async getProfile(uid: string): Promise<PlayerProfile> {
    if (!UID_REGEX.test(uid)) {
      throw new HSRInvalidUIDError(uid);
    }

    const cached = this.cache.get(uid);
    if (cached) {
      return this.parseResponse(uid, cached);
    }

    let pending = this.pendingRequests.get(uid);
    if (!pending) {
      pending = this.fetchWithFallback(uid).finally(() => {
        this.pendingRequests.delete(uid);
      });
      this.pendingRequests.set(uid, pending);
    }

    const response = await pending;
    this.cache.set(uid, response);
    return this.parseResponse(uid, response);
  }

  /**
   * Checks whether a UID string is a valid 9-digit format.
   * @param uid - The UID to validate.
   */
  static isValidUID(uid: string): boolean {
    return UID_REGEX.test(uid);
  }

  /** Clears the internal response cache. */
  clearCache(): void {
    this.cache.clear();
  }

  private async fetchWithFallback(uid: string): Promise<EnkaApiResponse> {
    let lastError: Error | undefined;

    for (let i = 0; i < this.providers.length; i++) {
      const url = `${this.providers[i]}/${uid}`;
      try {
        return await this.fetchWithRetry(url);
      } catch (err) {
        // Fatal errors — do not try next provider
        if (
          err instanceof HSRInvalidUIDError ||
          err instanceof HSRDataNotFoundError
        ) {
          throw err;
        }
        lastError = err instanceof Error ? err : new Error(String(err));
        // Try next provider
      }
    }

    throw lastError!;
  }

  private async fetchWithRetry(url: string): Promise<EnkaApiResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': `starrail-sdk/${SDK_VERSION}` },
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.status === 429) {
          throw new HSRRateLimitError('Enka.Network');
        }
        if (res.status === 404) {
          throw new HSRDataNotFoundError(`UID profile at ${url}`);
        }
        if (res.status >= 500) {
          throw new HSRSDKError(`Enka.Network server error: HTTP ${res.status}`);
        }
        if (!res.ok) {
          throw new HSRSDKError(`Enka.Network request failed: HTTP ${res.status} ${res.statusText}`);
        }

        return (await res.json()) as EnkaApiResponse;
      } catch (err) {
        clearTimeout(timer);

        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new HSRTimeoutError(url, this.timeoutMs);
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }

        // Do not retry fatal errors
        if (
          err instanceof HSRInvalidUIDError ||
          err instanceof HSRDataNotFoundError
        ) {
          throw err;
        }

        // Timeout: retry with backoff
        if (lastError instanceof HSRTimeoutError) {
          if (attempt < this.maxRetries - 1) {
            await this.delay(RETRY_DELAYS[attempt]);
            continue;
          }
          throw lastError;
        }

        if (attempt < this.maxRetries - 1) {
          await this.delay(RETRY_DELAYS[attempt]);
        }
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseResponse(uid: string, raw: EnkaApiResponse): PlayerProfile {
    const info = raw.detailInfo;
    if (!info) {
      throw new HSRDataNotFoundError(
        `player detail info for UID ${uid} (profile may be private, or Enka.Network has no cached snapshot for it)`
      );
    }
    const characters: PlayerCharacter[] = (info.avatarDetailList ?? []).map(avatar => {
      let stats: ComputedStats;

      if (avatar._statsMap && Object.keys(avatar._statsMap).length > 0) {
        // Legacy path: pre-computed stats map
        stats = this.mapStats(avatar._statsMap);
      } else {
        // Real API path: aggregate _flat.props from equipment + relics
        const propsMap: Record<string, number> = {};
        if (avatar.equipment?._flat?.props) {
          for (const p of avatar.equipment._flat.props) {
            propsMap[p.type] = (propsMap[p.type] ?? 0) + p.value;
          }
        }
        for (const relic of avatar.relicList ?? []) {
          if (relic._flat?.props) {
            for (const p of relic._flat.props) {
              propsMap[p.type] = (propsMap[p.type] ?? 0) + p.value;
            }
          }
        }
        stats = this.mapStats(propsMap);
      }

      // Apply base crit defaults if not set
      if (stats.critRate === 0) stats.critRate = 0.05;
      if (stats.critDmg === 0) stats.critDmg = 0.50;

      let equipment: PlayerEquipment | undefined;
      if (avatar.equipment) {
        equipment = {
          id: avatar.equipment.tid,
          level: avatar.equipment.level,
          promotion: avatar.equipment.promotion,
          rank: avatar.equipment.rank
        };
      }

      const relics: PlayerRelic[] = (avatar.relicList ?? []).map(r => ({
        id: r.tid,
        type: r.type,
        level: r.level,
        mainAffixId: r.mainAffixId,
        subAffixes: r.subAffixList
      }));

      return {
        id: avatar.avatarId,
        level: avatar.level,
        promotion: avatar.promotion,
        eidolon: avatar.rank,
        stats,
        equipment,
        relics,
        skillTreePoints: avatar.skillTreeList
      };
    });

    return {
      uid: String(info.uid),
      nickname: info.nickname,
      level: info.level,
      worldLevel: info.worldLevel,
      signature: info.signature ?? '',
      characters
    };
  }

  private mapStats(rawMap: Record<string, number>): ComputedStats {
    const stats = createEmptyStats();

    for (const [enkaKey, value] of Object.entries(rawMap)) {
      const sdkKey = ENKA_PROPERTY_MAP[enkaKey];
      if (sdkKey && sdkKey in stats) {
        (stats as unknown as Record<string, number>)[sdkKey] += value;
      }
    }

    return stats;
  }
}

