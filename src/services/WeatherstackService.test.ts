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
    // Reset global fetch mock before each test
    global.fetch = jest.fn() as any;
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
    } as any);

    const result = await service.fetchCurrentWeather('New York', 'NY');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=New%20York%2C%20NY%2C%20USA')
    );
    expect(result.weather?.temperature).toBe(22);
    expect(result.location?.lat).toBe('40.7128');
  });

  it('should handle Weatherstack success: false pattern (200 OK with error body)', async () => {
    const mockErrorResponse = {
      success: false,
      error: { code: 601, info: 'Invalid query' }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockErrorResponse
    } as any);

    await expect(service.fetchCurrentWeather('InvalidCity', 'XX'))
      .rejects.toThrow('Input: Missing or invalid query.');
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
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccess
      } as any);

    const result = await service.fetchCurrentWeather('RetryCity', 'ST');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.weather?.temperature).toBe(15);
  });

  it('should use cache for subsequent requests within TTL', async () => {
    const mockResponse = {
      location: { lat: '30', lon: '40' },
      current: { temperature: 10 }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as any);

    // First call (hits API)
    await service.fetchCurrentWeather('CacheCity', 'CC');
    // Second call (should hit cache)
    await service.fetchCurrentWeather('CacheCity', 'CC');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw error on HTTP failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as any);

    await expect(service.fetchCurrentWeather('FailCity', 'FC'))
      .rejects.toThrow('Weatherstack HTTP Error: 500 Internal Server Error');
  });
});
