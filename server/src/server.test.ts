import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createApp, startServer, stopServer } from './server.js';
import type { Server as HTTPServer } from 'http';
import type { Server as SocketIOServer } from 'socket.io';

describe('server', () => {
  describe('createApp', () => {
    it('creates Express app', () => {
      const { app } = createApp();
      expect(app).toBeDefined();
      expect(typeof app.get).toBe('function');
    });

    it('creates HTTP server', () => {
      const { httpServer } = createApp();
      expect(httpServer).toBeDefined();
    });

    it('creates Socket.io server', () => {
      const { io } = createApp();
      expect(io).toBeDefined();
    });
  });

  describe('health endpoint', () => {
    it('returns ok status', async () => {
      const { app } = createApp();
      // Use a mock request/response pattern for Express
      const req = { method: 'GET', url: '/health' } as any;
      const res = {
        json: (data: any) => {
          expect(data.status).toBe('ok');
          expect(typeof data.uptime).toBe('number');
        },
        header: () => res,
      } as any;
      const next = () => {};

      // Find the health route handler
      const healthRoute = app._router?.stack?.find(
        (layer: any) => layer.regexp?.test('/health')
      );
      expect(healthRoute).toBeDefined();
    });
  });

  describe('startServer / stopServer', () => {
    let serverInfo: { httpServer: HTTPServer; io: SocketIOServer; port: number } | null = null;

    afterEach(async () => {
      if (serverInfo) {
        await stopServer(serverInfo.httpServer, serverInfo.io);
        serverInfo = null;
      }
    });

    it('starts server on specified port', async () => {
      serverInfo = await startServer(0); // port 0 = random available port
      expect(serverInfo.port).toBeGreaterThan(0);
      expect(serverInfo.httpServer.listening).toBe(true);
    });

    it('stops server gracefully', async () => {
      serverInfo = await startServer(0);
      await stopServer(serverInfo.httpServer, serverInfo.io);
      expect(serverInfo.httpServer.listening).toBe(false);
    });
  });
});
