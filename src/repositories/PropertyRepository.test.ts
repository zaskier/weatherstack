import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// For ESM, unstable_mockModule is the way
jest.unstable_mockModule('../database/data-source.js', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

// We must use dynamic imports after unstable_mockModule
const { PropertyRepository } = await import('./PropertyRepository.js');
const { AppDataSource } = await import('../database/data-source.js');
const { Property } = await import('../entities/Property.js');

describe('PropertyRepository', () => {
  let repository: PropertyRepository;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockTypeormRepo: any;

  beforeEach(() => {
    mockTypeormRepo = {
      createQueryBuilder: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepo);
    repository = new PropertyRepository();
  });

  it('findAll should call createQueryBuilder and return results', async () => {
    const mockProperties = [new Property()];
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProperties)
    };
    mockTypeormRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const result = await repository.findAll({
      filters: { city: 'New York' },
      sortBy: 'createdAt',
      order: 'DESC'
    });

    expect(mockTypeormRepo.createQueryBuilder).toHaveBeenCalledWith('property');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('property.city = :city', {
      city: 'New York'
    });
    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('property.createdAt', 'DESC');
    expect(result).toEqual(mockProperties);
  });

  it('findOne should call findOneBy', async () => {
    const mockProperty = new Property();
    mockTypeormRepo.findOneBy.mockResolvedValue(mockProperty);

    const result = await repository.findOne('uuid');

    expect(mockTypeormRepo.findOneBy).toHaveBeenCalledWith({ id: 'uuid' });
    expect(result).toBe(mockProperty);
  });

  it('create should call create and save', async () => {
    const propertyData = { city: 'Berlin' };
    const mockProperty = { id: 'uuid', ...propertyData };
    mockTypeormRepo.create.mockReturnValue(mockProperty);
    mockTypeormRepo.save.mockResolvedValue(mockProperty);

    const result = await repository.create(propertyData);

    expect(mockTypeormRepo.create).toHaveBeenCalledWith(propertyData);
    expect(mockTypeormRepo.save).toHaveBeenCalledWith(mockProperty);
    expect(result).toBe(mockProperty);
  });

  it('delete should return true if affected > 0', async () => {
    mockTypeormRepo.delete.mockResolvedValue({ affected: 1 });

    const result = await repository.delete('uuid');

    expect(mockTypeormRepo.delete).toHaveBeenCalledWith('uuid');
    expect(result).toBe(true);
  });

  it('delete should return false if affected is 0', async () => {
    mockTypeormRepo.delete.mockResolvedValue({ affected: 0 });

    const result = await repository.delete('uuid');

    expect(result).toBe(false);
  });
});
