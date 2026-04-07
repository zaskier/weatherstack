import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import { AppDataSource } from './database/data-source.js';
import { fileURLToPath } from 'url';
import { join } from 'path';
import mercurius from 'mercurius';
import fastifyEnv from '@fastify/env';
import { schema } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { envSchema } from './config/env.js';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: process.env.NODE_ENV === 'test' ? false : true
  });

  // Load environment variables
  await fastify.register(fastifyEnv, {
    schema: envSchema,
    dotenv: {
      path: join(process.cwd(), 'src', '.env')
    }
  });

  fastify.register(mercurius, {
    schema,
    resolvers,
    graphiql: true
  });

  return fastify;
}

const start = async () => {
  try {
    const app = await buildApp();
    await app.ready();
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    await app.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}
