import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Property } from '../entities/Property.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'property',
  synchronize: false,
  logging: true,
  entities: [Property],
  migrations: ['src/database/migrations/*.ts', 'dist/database/migrations/*.js'],
  migrationsRun: true,
  subscribers: []
});
