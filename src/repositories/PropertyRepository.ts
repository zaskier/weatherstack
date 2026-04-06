import { Repository } from 'typeorm';
import { Property } from '../entities/Property.js';
import { AppDataSource } from '../database/data-source.js';

export class PropertyRepository {
  private repository: Repository<Property>;

  constructor() {
    this.repository = AppDataSource.getRepository(Property);
  }

  async findAll(options?: {
    sortBy?: 'createdAt';
    order?: 'ASC' | 'DESC';
    filters?: {
      city?: string;
      zipCode?: string;
      state?: string;
    };
  }): Promise<Property[]> {
    const queryBuilder = this.repository.createQueryBuilder('property');

    if (options?.filters) {
      if (options.filters.city) {
        queryBuilder.andWhere('property.city = :city', { city: options.filters.city });
      }
      if (options.filters.zipCode) {
        queryBuilder.andWhere('property.zipCode = :zipCode', {
          zipCode: options.filters.zipCode
        });
      }
      if (options.filters.state) {
        queryBuilder.andWhere('property.state = :state', { state: options.filters.state });
      }
    }

    if (options?.sortBy === 'createdAt') {
      queryBuilder.orderBy('property.createdAt', options.order || 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Property | null> {
    return await this.repository.findOneBy({ id });
  }

  async create(propertyData: Partial<Property>): Promise<Property> {
    const property = this.repository.create(propertyData);
    return await this.repository.save(property);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
