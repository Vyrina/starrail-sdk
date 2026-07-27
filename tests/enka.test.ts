import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnkaClient } from '../src/api/enka.js';
import { HSRInvalidUIDError } from '../src/types/errors.js';
import mockData from './fixtures/enka_mock_uid.json';

describe('EnkaClient', () => {
  describe('UID validation', () => {
    it('rejects UID shorter than 9 digits', () => {
      const client = new EnkaClient();
      expect(client.getProfile('12345678')).rejects.toThrow(HSRInvalidUIDError);
    });

    it('rejects UID longer than 9 digits', () => {
      const client = new EnkaClient();
      expect(client.getProfile('1234567890')).rejects.toThrow(HSRInvalidUIDError);
    });

    it('rejects UID starting with 0', () => {
      const client = new EnkaClient();
      expect(client.getProfile('012345678')).rejects.toThrow(HSRInvalidUIDError);
    });

    it('rejects non-numeric UID', () => {
      const client = new EnkaClient();
      expect(client.getProfile('abcdefghi')).rejects.toThrow(HSRInvalidUIDError);
    });

    it('rejects empty string', () => {
      const client = new EnkaClient();
      expect(client.getProfile('')).rejects.toThrow(HSRInvalidUIDError);
    });

    it('static isValidUID works correctly', () => {
      expect(EnkaClient.isValidUID('800123456')).toBe(true);
      expect(EnkaClient.isValidUID('012345678')).toBe(false);
      expect(EnkaClient.isValidUID('12345')).toBe(false);
    });
  });

  describe('Profile parsing (mocked fetch)', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData)
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('parses player profile from mock response', async () => {
      const client = new EnkaClient();
      const profile = await client.getProfile('800123456');

      expect(profile.uid).toBe('800123456');
      expect(profile.nickname).toBe('TestTrailblazer');
      expect(profile.level).toBe(70);
      expect(profile.worldLevel).toBe(6);
      expect(profile.signature).toBe('Testing SDK');
    });

    it('parses character stats via property mapping', async () => {
      const client = new EnkaClient();
      const profile = await client.getProfile('800123456');

      expect(profile.characters).toHaveLength(1);
      const char = profile.characters[0];

      expect(char.id).toBe(1001);
      expect(char.level).toBe(80);
      expect(char.eidolon).toBe(0);

      expect(char.stats.baseHp).toBe(1047.82);
      expect(char.stats.flatHp).toBe(352.4);
      expect(char.stats.percentHp).toBe(0.1233);
      expect(char.stats.baseAtk).toBe(582.12);
      expect(char.stats.critRate).toBe(0.302);
      expect(char.stats.critDmg).toBe(1.124);
      expect(char.stats.fireDmgBoost).toBe(0.388);
      expect(char.stats.energyRecovery).toBe(0.1);
    });

    it('parses equipment data', async () => {
      const client = new EnkaClient();
      const profile = await client.getProfile('800123456');
      const equipment = profile.characters[0].equipment;

      expect(equipment).toBeDefined();
      expect(equipment!.id).toBe(21001);
      expect(equipment!.level).toBe(80);
      expect(equipment!.rank).toBe(1);
    });

    it('parses relic list', async () => {
      const client = new EnkaClient();
      const profile = await client.getProfile('800123456');
      const relics = profile.characters[0].relics;

      expect(relics).toHaveLength(2);
      expect(relics[0].id).toBe(61011);
      expect(relics[1].id).toBe(61012);
    });

    it('caches responses to avoid duplicate fetches', async () => {
      const client = new EnkaClient();
      await client.getProfile('800123456');
      await client.getProfile('800123456');

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Fallback providers', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('falls back to second provider when first returns 5xx', async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.startsWith('https://primary.example.com')) {
          return Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockData),
        });
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new EnkaClient({
        providers: [
          'https://primary.example.com/api/hsr/uid',
          'https://fallback.example.com/api/hsr/uid',
        ],
        maxRetries: 1,
      });

      const profile = await client.getProfile('800123456');
      expect(profile.uid).toBe('800123456');

      // First provider tried once (maxRetries=1), then fallback tried
      const primaryCalls = fetchMock.mock.calls.filter(
        (c: string[]) => c[0].startsWith('https://primary.example.com')
      );
      const fallbackCalls = fetchMock.mock.calls.filter(
        (c: string[]) => c[0].startsWith('https://fallback.example.com')
      );
      expect(primaryCalls.length).toBe(1);
      expect(fallbackCalls.length).toBe(1);
    });

    it('does not try next provider on 404 (fatal)', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new EnkaClient({
        providers: [
          'https://primary.example.com/api/hsr/uid',
          'https://fallback.example.com/api/hsr/uid',
        ],
        maxRetries: 1,
      });

      await expect(client.getProfile('800123456')).rejects.toThrow('not found');
      // Only the primary was called
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][0]).toContain('primary.example.com');
    });

    it('throws last error when all providers fail', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
      });

      vi.stubGlobal('fetch', fetchMock);

      const client = new EnkaClient({
        providers: [
          'https://primary.example.com/api/hsr/uid',
          'https://fallback.example.com/api/hsr/uid',
        ],
        maxRetries: 1,
      });
      // Override delay to skip waits
      (client as unknown as { delay: (ms: number) => Promise<void> }).delay = () => Promise.resolve();

      await expect(client.getProfile('800123456')).rejects.toThrow('server error');
      // Both providers tried
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
