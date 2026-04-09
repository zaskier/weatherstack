import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { WeatherstackService } from './WeatherstackService.js';
import { WeatherstackConfig } from '../types/weather.js';

describe('WeatherstackService', () => {
  let service: WeatherstackService;
  const mockConfig: WeatherstackConfig = {
    WEATHER_API_KEY: 'test-key',
    WEATHER_API_URL: 'https://api.test/'
  };

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    service = new WeatherstackService(mockConfig);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch weather data successfully (Happy Path)', async () => {
    const mockApiResponse = {
      location: { lat: '40.7128', lon: '-74.0060' },
      current: { temperature: 22, weather_descriptions: ['Sunny'] }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    } as unknown as Response);

    const result = await service.fetchCurrentWeather('New York', 'NY');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('query=New%20York%2C%20NY'));
    expect(result.weather?.temperature).toBe(22);
    expect(result.location?.lat).toBe('40.7128');
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Cache MISS'));
  });

  it('should handle Weatherstack success: false pattern (200 OK with error body)', async () => {
    const mockErrorResponse = {
      success: false,
      error: { code: 601, info: 'Invalid query' }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockErrorResponse
    } as unknown as Response);

    await expect(service.fetchCurrentWeather('InvalidCity', 'XX')).rejects.toThrow(
      'Input: Missing or invalid query.'
    );
  });

  it('should retry once on error code 615', async () => {
    const mock615Error = {
      success: false,
      error: { code: 615, info: 'Request failed' }
    };
    const mockSuccess = {
      location: { lat: '10', lon: '20' },
      current: { temperature: 15 }
    };

    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mock615Error
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccess
      } as unknown as Response);

    const result = await service.fetchCurrentWeather('RetryCity', 'ST', 1, 0);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.weather?.temperature).toBe(15);
  });

  it('should retry on HTTP 429 status code', async () => {
    const mockSuccess = {
      location: { lat: '10', lon: '20' },
      current: { temperature: 20 }
    };

    const fetchMock = global.fetch as jest.Mock;
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccess
      } as unknown as Response);

    const result = await service.fetchCurrentWeather('RateLimitCity', 'RL', 1, 0); // 0 delay for test speed

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.weather?.temperature).toBe(20);
  });

  it('should use cache for subsequent requests within TTL', async () => {
    const mockResponse = {
      location: { lat: '30', lon: '40' },
      current: { temperature: 10 }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as unknown as Response);

    // First call (hits API)
    await service.fetchCurrentWeather('CacheCity', 'CC');
    // Second call (should hit cache)
    await service.fetchCurrentWeather('CacheCity', 'CC');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Cache HIT'));
  });

  it('should respect LRU capacity (200 entries)', async () => {
    const mockResponse = {
      location: { lat: '30', lon: '40' },
      current: { temperature: 10 }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as unknown as Response);

    // Fill the cache with 200 items
    for (let i = 0; i < 200; i++) {
      await service.fetchCurrentWeather(`City${i}`, 'ST');
    }
    expect(global.fetch).toHaveBeenCalledTimes(200);

    // Call 201st item (should evict oldest)
    await service.fetchCurrentWeather('City200', 'ST');
    expect(global.fetch).toHaveBeenCalledTimes(201);

    // Call City0 again (should be a MISS now)
    await service.fetchCurrentWeather('City0', 'ST');
    expect(global.fetch).toHaveBeenCalledTimes(202);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Cache MISS for City0'));
  });

  it('should throw error on HTTP failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as unknown as Response);

    await expect(service.fetchCurrentWeather('FailCity', 'FC')).rejects.toThrow(
      'Weatherstack HTTP Error: 500 Internal Server Error'
    );
  });
});
