import { LRUCache } from './cache.js';
import { HSRSDKError, HSRDataNotFoundError, HSRTimeoutError } from '../types/errors.js';
import type { StarRailResCharacter, StarRailResLightCone, StarRailResRelic } from '../types/api.js';
import { SDK_VERSION } from '../version.js';

const SUPPORTED_LANGS = ['en', 'cn', 'jp', 'kr'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

// Mar-7th/StarRailRes CDN options (GitHub Raw + jsDelivr mirror)
const DEFAULT_PROVIDERS = [
  'https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/index_min',
  'https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/index_min',
];
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RETRIES = 3;
// exponential backoff: 1s, 2s, 4s
const RETRY_DELAYS = [1000, 2000, 4000];

export interface StarRailResClientOptions {
  lang?: string;
  cacheMaxSize?: number;
  cacheTtlMs?: number;
  timeoutMs?: number;
  maxRetries?: number;
  providers?: string[];
}

/**
 * Client for fetching game data (characters, light cones, relics) from the StarRailRes CDN.
 * Supports multi-provider fallback (GitHub Raw + jsDelivr), LRU caching, and retry with exponential backoff.
 */
export class StarRailResClient {
  private readonly lang: SupportedLang;
  private readonly providers: string[];
  private cache: LRUCache<unknown>;
  private pendingRequests = new Map<string, Promise<unknown>>();
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  /**
   * @param langOrOptions - Language code (`'en'`, `'cn'`, `'jp'`, `'kr'`) or a full options object.
   * @throws {@link HSRSDKError} if the language is not supported.
   */
  constructor(langOrOptions?: string | StarRailResClientOptions) {
    let lang = 'en';
    let cacheMaxSize: number | undefined;
    let cacheTtlMs: number | undefined;
    let timeoutMs: number | undefined;
    let maxRetries: number | undefined;
    let customProviders: string[] | undefined;

    if (typeof langOrOptions === 'string') {
      lang = langOrOptions;
    } else if (langOrOptions) {
      lang = langOrOptions.lang ?? 'en';
      cacheMaxSize = langOrOptions.cacheMaxSize;
      cacheTtlMs = langOrOptions.cacheTtlMs;
      timeoutMs = langOrOptions.timeoutMs;
      maxRetries = langOrOptions.maxRetries;
      customProviders = langOrOptions.providers;
    }

    if (!SUPPORTED_LANGS.includes(lang as SupportedLang)) {
      throw new HSRSDKError(
        `Unsupported language: "${lang}". Supported: ${SUPPORTED_LANGS.join(', ')}`
      );
    }

    this.lang = lang as SupportedLang;
    this.providers = customProviders?.length ? customProviders : DEFAULT_PROVIDERS;
    this.cache = new LRUCache<unknown>(cacheMaxSize, cacheTtlMs);
    this.timeoutMs = timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  /** Fetches the full character index for the configured language. */
  async getCharacters(): Promise<Record<string, StarRailResCharacter>> {
    return this.fetchResource<Record<string, StarRailResCharacter>>('characters.json');
  }

  /** Fetches the full light cone index for the configured language. */
  async getLightCones(): Promise<Record<string, StarRailResLightCone>> {
    return this.fetchResource<Record<string, StarRailResLightCone>>('light_cones.json');
  }

  /** Fetches the full relic set index for the configured language. */
  async getRelics(): Promise<Record<string, StarRailResRelic>> {
    return this.fetchResource<Record<string, StarRailResRelic>>('relics.json');
  }

  /** Clears the internal response cache. */
  clearCache(): void {
    this.cache.clear();
  }

  private async fetchResource<T>(filename: string): Promise<T> {
    const cacheKey = `${this.lang}:${filename}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached as T;

    let pending = this.pendingRequests.get(cacheKey) as Promise<T> | undefined;
    if (!pending) {
      pending = this.fetchWithFallback<T>(filename).finally(() => {
        this.pendingRequests.delete(cacheKey);
      });
      this.pendingRequests.set(cacheKey, pending);
    }

    const data = await pending;
    this.cache.set(cacheKey, data);
    return data;
  }

  private async fetchWithFallback<T>(filename: string): Promise<T> {
    let lastError: Error | undefined;

    for (const provider of this.providers) {
      const baseUrl = provider.replace(/\/$/, '');
      const url = `${baseUrl}/${this.lang}/${filename}`;

      try {
        return await this.fetchWithRetry<T>(url, filename);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof HSRDataNotFoundError) {
          throw err; // 404 is fatal, do not try other providers
        }
      }
    }

    throw lastError ?? new HSRSDKError(`Failed to fetch ${filename} from all providers.`);
  }

  private async fetchWithRetry<T>(url: string, filename: string): Promise<T> {
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

        if (res.status === 404) {
          throw new HSRDataNotFoundError(`${filename} (lang: ${this.lang})`);
        }
        if (res.status >= 500) {
          throw new HSRSDKError(`StarRailRes server error: HTTP ${res.status}`);
        }
        if (!res.ok) {
          throw new HSRSDKError(`Failed to fetch ${filename}: HTTP ${res.status} ${res.statusText}`);
        }

        return (await res.json()) as T;
      } catch (err) {
        clearTimeout(timer);

        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new HSRTimeoutError(url, this.timeoutMs);
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }

        // Do not retry fatal errors
        if (err instanceof HSRDataNotFoundError) {
          throw err;
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
}
