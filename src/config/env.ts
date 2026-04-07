export const envSchema = {
  type: 'object',
  required: ['WEATHER_API_KEY', 'WEATHER_API_URL'],
  properties: {
    WEATHER_API_KEY: { type: 'string' },
    WEATHER_API_URL: { type: 'string' },
    DB_HOST: { type: 'string' },
    DB_PORT: { type: 'string' },
    DB_USERNAME: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
    DB_NAME: { type: 'string' }
  }
};
