import { WeatherstackConfig } from './weather.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: WeatherstackConfig & {
      DB_HOST?: string;
      DB_PORT?: string;
      DB_USERNAME?: string;
      DB_PASSWORD?: string;
      DB_NAME?: string;
    };
  }
}
