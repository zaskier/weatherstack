import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { buildApp } from './index.js';
import { FastifyInstance } from 'fastify';
import request from 'supertest';

describe('App', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health should return 200 and status ok', async () => {
    const response = await request(app.server).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
