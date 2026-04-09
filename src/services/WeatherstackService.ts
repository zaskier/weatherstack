import { WeatherstackResponse, WeatherstackConfig, RawWeatherData } from '../types/weather.js';
import { LRUCache } from 'lru-cache';

export class WeatherstackService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private cache: LRUCache<string, WeatherstackResponse>;

  constructor(config: WeatherstackConfig) {
    this.apiKey = config.WEATHER_API_KEY;
    this.apiUrl = config.WEATHER_API_URL;

    if (!this.apiKey) {
      throw new Error('WEATHER_API_KEY is not provided in config');
    }

    // LRU Cache with fixed size and automatic TTL cleanup
    this.cache = new LRUCache({
      max: 200, // Maximum number of locations to store
      ttl: 20 * 60 * 1000, // 20-minute TTL
      allowStale: false,
      updateAgeOnGet: false
    });
  }

  /**
   * Includes exponential backoff retry for 429 and 615 errors, and memory-safe LRU caching.
   */
  async fetchCurrentWeather(
    city: string,
    state: string,
    retryCount = 1,
    delay = 1000
  ): Promise<WeatherstackResponse> {
    const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`.trim();

    // Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.info(`[WeatherstackService] Cache HIT for ${city}, ${state}`);
      return cached;
    }

    console.info(`[WeatherstackService] Cache MISS for ${city}, ${state}`);

    const query = encodeURIComponent(`${city}, ${state}`);
    const url = `${this.apiUrl}current?access_key=${this.apiKey}&query=${query}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Handle Rate Limiting at HTTP level
        if (response.status === 429 && retryCount > 0) {
          console.warn(`[WeatherstackService] HTTP 429: Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return await this.fetchCurrentWeather(city, state, retryCount - 1, delay * 2);
        }
        throw new Error(`Weatherstack HTTP Error: ${response.status} ${response.statusText}`);
      }

      const apiData = (await response.json()) as Record<string, unknown>;

      // Weatherstack quirk: Handle successful HTTP but logical failure
      if (apiData.success === false && apiData.error) {
        const error = apiData.error as { code: number; info: string };

        // Retry logic for 615 (Generic Failure)
        if (error.code === 615 && retryCount > 0) {
          console.warn(`[WeatherstackService] API 615: Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return await this.fetchCurrentWeather(city, state, retryCount - 1, delay * 2);
        }
        this.handleApiError(error);
      }

      const data: WeatherstackResponse = {
        ...(apiData as unknown as WeatherstackResponse),
        weather: apiData.current as RawWeatherData
      };

      if (!data.location || !data.weather) {
        throw new Error('Weatherstack returned incomplete payload');
      }

      // Update Cache
      this.cache.set(cacheKey, data);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[WeatherstackService] Fetch failed: ${error.message}`);
      }
      throw error;
    }
  }

  private handleApiError(error: { code: number; info: string }): never {
    const { code, info } = error;

    switch (code) {
      case 101:
        throw new Error('Auth: Invalid API key.');
      case 403:
        throw new Error('Plan: Feature not supported (check HTTPS/Bulk/Forecast permissions).');
      case 601:
        throw new Error('Input: Missing or invalid query.');
      case 604:
        throw new Error('Plan: Bulk queries not supported.');
      case 615:
        throw new Error('API: Generic request failure. This is retry-eligible.');
      case 429:
        throw new Error('Limit: Rate limit exceeded. Implement backoff.');
      default:
        throw new Error(`Weatherstack API Error ${code}: ${info}`);
    }
  }
}
