import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().default('app'),
  DB_PASS: Joi.string().default('app'),
  DB_NAME: Joi.string().default('multitenant'),

  JWT_SECRET: Joi.string().default('change-me-in-production'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().default('change-me-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
});
