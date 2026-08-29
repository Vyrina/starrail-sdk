// Types
export * from './types/character.js';
export * from './types/relic.js';
export * from './types/player.js';
export * from './types/stats.js';
export * from './types/api.js';
export * from './types/errors.js';

// Constants
export * from './constants/enka_properties.js';
export * from './constants/game_constants.js';
export * from './constants/relic_constants.js';
export * from './constants/hsr_code_names.js';

// Calculators
export * from './calculators/turn.js';
export * from './calculators/damage.js';
export * from './calculators/break.js';
export * from './calculators/status.js';
export * from './calculators/energy.js';
export * from './calculators/relic.js';

// Resolvers
export * from './resolvers/character.js';
export * from './resolvers/stats.js';

// API clients
export * from './api/enka.js';
export * from './api/starrailres.js';
export * from './api/cache.js';

// Version
export * from './version.js';

import { EnkaClient } from './api/enka.js';
import type { EnkaClientOptions } from './api/enka.js';
import { StarRailResClient } from './api/starrailres.js';

export interface StarRailSDKOptions {
  lang?: string;
  cache?: {
    maxSize?: number;
    ttlMs?: number;
  };
  timeoutMs?: number;
  maxRetries?: number;
  enkaProviders?: string[];
  resProviders?: string[];
}

export class StarRailSDK {
  public enka: EnkaClient;
  public res: StarRailResClient;

  constructor(options?: StarRailSDKOptions) {
    const enkaOpts: EnkaClientOptions = {
      cacheMaxSize: options?.cache?.maxSize,
      cacheTtlMs: options?.cache?.ttlMs,
      timeoutMs: options?.timeoutMs,
      maxRetries: options?.maxRetries,
      providers: options?.enkaProviders,
    };

    this.enka = new EnkaClient(enkaOpts);
    this.res = new StarRailResClient({
      lang: options?.lang ?? 'en',
      cacheMaxSize: options?.cache?.maxSize,
      cacheTtlMs: options?.cache?.ttlMs,
      timeoutMs: options?.timeoutMs,
      maxRetries: options?.maxRetries,
      providers: options?.resProviders,
    });
  }
}
