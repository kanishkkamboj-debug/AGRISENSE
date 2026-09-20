import { logger } from "./logger";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LocationCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMinutes = 10) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      logger.info(`LOCATION_CACHE_MISS key=${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      logger.info(`LOCATION_CACHE_EXPIRED key=${key}`);
      this.cache.delete(key);
      return null;
    }

    logger.info(`LOCATION_CACHE_HIT key=${key}`);
    return entry.value;
  }

  set(key: string, value: T): void {
    const isRefresh = this.cache.has(key);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });

    if (isRefresh) {
      logger.info(`LOCATION_CACHE_REFRESH key=${key}`);
    } else {
      logger.info(`LOCATION_CACHE_SET key=${key}`);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const locationCache = new LocationCache(10);
