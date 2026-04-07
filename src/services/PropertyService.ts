import { Property } from '../entities/Property.js';
import { PropertyRepository } from '../repositories/PropertyRepository.js';

export class PropertyService {
  private propertyRepository: PropertyRepository;

  constructor() {
    this.propertyRepository = new PropertyRepository();
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
    // MOCK: Todo replace with real Weatherstack API calls
    const mockedWeatherData = {
      current: {
        observation_time: '12:00 PM',
        temperature: 20,
        weather_code: 113,
        weather_icons: [
          'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png'
        ],
        weather_descriptions: ['Sunny'],
        wind_speed: 10,
        wind_degree: 180,
        wind_dir: 'S',
        pressure: 1010,
        precip: 0,
        humidity: 50,
        cloudcover: 0,
        feelslike: 20,
        uv_index: 5,
        visibility: 10,
        is_day: 'yes'
      }
    };
    const mockedLat = 33.609;
    const mockedLong = -111.729;

    const property = await this.propertyRepository.create({
      ...data,
      weatherData: mockedWeatherData,
      lat: mockedLat,
      long: mockedLong
    });

    return property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return await this.propertyRepository.delete(id);
  }
}
