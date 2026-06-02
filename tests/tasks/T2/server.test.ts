import request from 'supertest';
import { createServer } from '../../src/server';

describe('Server Scaffolding', () => {
  describe('Express Server Setup', () => {
    test('should create an Express application', () => {
      const app = createServer();
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
    });

    test('should respond to GET /health with 200 OK', async () => {
      const app = createServer();
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    test('should have CORS configured to allow cross-origin requests', async () => {
      const app = createServer();
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should parse JSON request bodies', async () => {
      const app = createServer();
      // The server should have express.json() middleware
      const response = await request(app)
        .post('/test-json')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      // If middleware is set up, this shouldn't be a 400 for malformed JSON
      expect(response.status).not.toBe(400);
    });

    test('should have a configurable port', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '9999';
      const app = createServer();
      // The server should be able to start on the configured port
      expect(app).toBeDefined();
      process.env.PORT = originalPort;
    });
  });

  describe('Environment Configuration', () => {
    test('should load environment variables from .env file', () => {
      // The server module should import dotenv config
      expect(() => {
        require('../../src/config');
      }).not.toThrow();
    });

    test('should have a default port when PORT is not set', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;
      const app = createServer();
      expect(app).toBeDefined();
      process.env.PORT = originalPort;
    });
  });
});
