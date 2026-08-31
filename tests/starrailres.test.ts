import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StarRailResClient } from '../src/api/starrailres.js';
import { HSRSDKError, HSRDataNotFoundError, HSRRateLimitError, HSRTimeoutError } from '../src/types/errors.js';

describe('StarRailResClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('accepts string lang shorthand', () => {
      const client = new StarRailResClient('jp');
      expect(client).toBeInstanceOf(StarRailResClient);
    });

    it('accepts options object', () => {
      const client = new StarRailResClient({ lang: 'kr', timeoutMs: 5000, maxRetries: 2 });
      expect(client).toBeInstanceOf(StarRailResClient);
    });

    it('throws on unsupported language', () => {
      expect(() => new StarRailResClient('fr')).toThrow(HSRSDKError);
    });

    it('defaults to en when no options given', () => {
      const client = new StarRailResClient();
      expect(client).toBeInstanceOf(StarRailResClient);
    });
  });

  describe('fetchResource with retry', () => {
    it('returns data on successful fetch', async () => {
      const mockData = { '1001': { id: '1001', name: 'March 7th' } };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      }));

      const client = new StarRailResClient('en');
      const result = await client.getCharacters();
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('retries on 5xx and succeeds', async () => {
      const mockData = { '1001': { id: '1001', name: 'March 7th' } };
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' })
        .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockData) });

      vi.stubGlobal('fetch', fetchMock);

      const client = new StarRailResClient({ lang: 'en', maxRetries: 3 });
      // Override delay to avoid waiting in tests
      (client as unknown as { delay: (ms: number) => Promise<void> }).delay = () => Promise.resolve();

      const result = await client.getCharacters();
      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 404', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new StarRailResClient({ lang: 'en', maxRetries: 3 });
      await expect(client.getCharacters()).rejects.toThrow(HSRDataNotFoundError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws HSRRateLimitError on 429 (retries with backoff like 5xx)', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new StarRailResClient({ lang: 'en', maxRetries: 2, providers: ['https://cdn.example.com'] });
      (client as unknown as { delay: (ms: number) => Promise<void> }).delay = () => Promise.resolve();

      await expect(client.getCharacters()).rejects.toThrow(HSRRateLimitError);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws after all retries exhausted', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new StarRailResClient({ lang: 'en', maxRetries: 2, providers: ['https://cdn.example.com'] });
      (client as unknown as { delay: (ms: number) => Promise<void> }).delay = () => Promise.resolve();

      await expect(client.getCharacters()).rejects.toThrow(HSRSDKError);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('uses cache on second call', async () => {
      const mockData = { '1001': { id: '1001', name: 'March 7th' } };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      }));

      const client = new StarRailResClient('en');
      await client.getCharacters();
      await client.getCharacters();
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent requests to the same resource', async () => {
      const mockData = { '1001': { id: '1001', name: 'March 7th' } };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      }));

      const client = new StarRailResClient('en');
      const [r1, r2, r3] = await Promise.all([
        client.getCharacters(),
        client.getCharacters(),
        client.getCharacters(),
      ]);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(r1).toEqual(mockData);
      expect(r2).toEqual(mockData);
      expect(r3).toEqual(mockData);
    });

    it('clearCache forces refetch', async () => {
      const mockData = { '1001': { id: '1001', name: 'March 7th' } };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      }));

      const client = new StarRailResClient('en');
      await client.getCharacters();
      client.clearCache();
      await client.getCharacters();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('timeout handling', () => {
    it('throws HSRTimeoutError on abort', async () => {
      const fetchMock = vi.fn().mockImplementation(() => {
        const err = new DOMException('The operation was aborted', 'AbortError');
        return Promise.reject(err);
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new StarRailResClient({ lang: 'en', timeoutMs: 100, maxRetries: 1 });

      await expect(client.getCharacters()).rejects.toThrow(HSRTimeoutError);
    });
  });

  describe('fallback provider chain', () => {
    it('switches to secondary provider if primary fails with 5xx', async () => {
      const mockData = { '1001': { id: '1001', name: 'March 7th' } };
      const fetchMock = vi.fn()
        // Primary provider (3 retries failed)
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        // Secondary provider (succeeds)
        .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(mockData) });

      vi.stubGlobal('fetch', fetchMock);

      const client = new StarRailResClient({
        lang: 'en',
        maxRetries: 2,
        providers: [
          'https://primary-cdn.com',
          'https://secondary-cdn.com',
        ],
      });
      (client as unknown as { delay: (ms: number) => Promise<void> }).delay = () => Promise.resolve();

      const result = await client.getCharacters();
      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://primary-cdn.com/en/characters.json', expect.any(Object));
      expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://secondary-cdn.com/en/characters.json', expect.any(Object));
    });
  });

  describe('resource endpoints', () => {
    it('resource getter methods return parsed json', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true })
      }));

      const client = new StarRailResClient('en');

      expect(await client.getLightCones()).toEqual({ ok: true });
      expect(await client.getRelics()).toEqual({ ok: true });
      expect(await client.getRelicSets()).toEqual({ ok: true });
      expect(await client.getSkillTrees()).toEqual({ ok: true });
      expect(await client.getLightConeRanks()).toEqual({ ok: true });
      expect(await client.getCharacterPromotions()).toEqual({ ok: true });
    });
  });
});

