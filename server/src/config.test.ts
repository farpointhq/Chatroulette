import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig } from './config.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;
    delete process.env.NODE_ENV;
  });

  it('returns defaults when env vars are missing', () => {
    const config = loadConfig();
    expect(config.port).toBe(3001);
    expect(config.corsOrigin).toBe('http://localhost:5173');
    expect(config.nodeEnv).toBe('development');
  });

  it('parses PORT as a number', () => {
    process.env.PORT = '8080';
    const config = loadConfig();
    expect(config.port).toBe(8080);
    expect(typeof config.port).toBe('number');
  });

  it('loads CORS_ORIGIN from env', () => {
    process.env.CORS_ORIGIN = 'https://example.com';
    const config = loadConfig();
    expect(config.corsOrigin).toBe('https://example.com');
  });

  it('loads NODE_ENV from env', () => {
    process.env.NODE_ENV = 'production';
    const config = loadConfig();
    expect(config.nodeEnv).toBe('production');
  });
});
