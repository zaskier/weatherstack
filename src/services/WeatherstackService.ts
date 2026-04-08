import { WeatherstackResponse, CacheEntry, WeatherstackConfig } from '../types/weather.js';

export class WeatherstackService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private cache: Map<string, CacheEntry> = new Map();
  // Cahche for the same city request for TTL: 20 minutes
  private readonly CACHE_TTL = 20 * 60 * 1000;

  constructor(config: WeatherstackConfig) {
    this.apiKey = config.WEATHER_API_KEY;
    this.apiUrl = config.WEATHER_API_URL;

    if (!this.apiKey) {
      throw new Error('WEATHER_API_KEY is not provided in config');
    }
  }

  /**
   * Includes 1-level retry for 615 errors and In-memory Caching.
   */
  async fetchCurrentWeather(
    city: string,
    state: string,
    retryCount = 1
  ): Promise<WeatherstackResponse> {
    const cacheKey = `${city.toLowerCase()}_${state.toLowerCase()}`.trim();

    // Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const query = encodeURIComponent(`${city}, ${state}`);
    const url = `${this.apiUrl}current?access_key=${this.apiKey}&query=${query}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weatherstack HTTP Error: ${response.status} ${response.statusText}`);
      }

      const apiData: any = await response.json();

      // Weatherstack quirk: Handle successful HTTP but logical failure
      if (apiData.success === false && apiData.error) {
        // Retry logic for 615 (Generic Failure)
        if (apiData.error.code === 615 && retryCount > 0) {
          console.warn(`[WeatherstackService] Retrying due to error 615 for ${city}`);
          return await this.fetchCurrentWeather(city, state, retryCount - 1);
        }
        this.handleApiError(apiData.error);
      }

      const data: WeatherstackResponse = {
        ...apiData,
        weather: apiData.current
      };

      if (!data.location || !data.weather) {
        throw new Error('Weatherstack returned incomplete payload');
      }

      // Update Cache
      this.cache.set(cacheKey, {
        data,
        expiry: Date.now() + this.CACHE_TTL
      });

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
