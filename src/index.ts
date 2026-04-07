import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import { AppDataSource } from './database/data-source.js';
import { fileURLToPath } from 'url';
import mercurius from 'mercurius';
import { schema } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true
  });

  fastify.register(mercurius, {
    schema,
    resolvers,
    graphiql: true
  });

  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  return fastify;
}

const start = async () => {
  try {
    // Initialize Data Source
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const app = await buildApp();
    await app.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}
