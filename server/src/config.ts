import type { ServerConfig } from './types.js';

export function loadConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  };
}
