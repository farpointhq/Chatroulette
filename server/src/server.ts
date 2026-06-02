import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { loadConfig } from './config.js';
import { createHealthRouter } from './middleware/health.js';
import { createCorsMiddleware } from './middleware/cors.js';
import { registerSocketHandlers } from './socket/handlers.js';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: loadConfig().corsOrigin, methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  app.use(createCorsMiddleware());
  app.use('/health', createHealthRouter());

  registerSocketHandlers(io);

  return { app, httpServer, io };
}

export async function startServer(port?: number) {
  const config = loadConfig();
  const { httpServer, io } = createApp();
  const actualPort = port ?? config.port;

  // Graceful shutdown for cloud deploys
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await stopServer(httpServer, io);
    process.exit(0);
  });

  return new Promise<{ httpServer: ReturnType<typeof createServer>; io: SocketIOServer; port: number }>((resolve) => {
    httpServer.listen(actualPort, () => {
      const address = httpServer.address();
      const resolvedPort = typeof address === 'object' && address !== null ? address.port : actualPort;
      console.log(`🚀 Server listening on port ${resolvedPort}`);
      resolve({ httpServer, io, port: resolvedPort });
    });
  });
}

export async function stopServer(httpServer: ReturnType<typeof createServer>, io?: SocketIOServer) {
  io?.close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
}
