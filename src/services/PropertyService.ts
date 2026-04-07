import { Property } from '../entities/Property.js';
import { PropertyRepository } from '../repositories/PropertyRepository.js';
import { WeatherstackService } from './WeatherstackService.js';
import { WeatherstackConfig } from '../types/weather.js';

export class PropertyService {
  private propertyRepository: PropertyRepository;
  private weatherstackService: WeatherstackService;

  constructor(config: WeatherstackConfig) {
    this.propertyRepository = new PropertyRepository();
    this.weatherstackService = new WeatherstackService(config);
  }

  async getAllProperties(options?: {
    sortBy?: 'createdAt';
    order?: 'ASC' | 'DESC';
    filters?: {
      city?: string;
      zipCode?: string;
      state?: string;
    };
  }): Promise<Property[]> {
    return await this.propertyRepository.findAll(options);
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findOne(id);
  }

  async createProperty(data: {
    city: string;
    street: string;
    state: string;
    zipCode: string;
  }): Promise<Property> {
    const weatherResponse = await this.weatherstackService.fetchCurrentWeather(
      data.city,
      data.state
    );

    if (!weatherResponse.location || !weatherResponse.weather) {
      throw new Error('Incomplete weather data received from API');
    }

    const property = await this.propertyRepository.create({
      ...data,
      weather: weatherResponse.weather,
      lat: parseFloat(weatherResponse.location.lat),
      long: parseFloat(weatherResponse.location.lon)
    });

    return property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return await this.propertyRepository.delete(id);
  }
}
