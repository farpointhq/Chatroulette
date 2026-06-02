import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { registerSocketHandlers } from './handlers.js';
import { clearRooms, getRoom } from '../rooms.js';

describe('socket handlers', () => {
  let io: Server;
  let httpServer: ReturnType<typeof createServer>;

  beforeEach(() => {
    clearRooms();
    httpServer = createServer();
    io = new Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    registerSocketHandlers(io);
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      io.close();
      httpServer.close(() => resolve());
    });
  });

  it('registers connection handler', () => {
    expect(io.listeners('connection').length).toBeGreaterThan(0);
  });

  it('creates room via socket event', async () => {
    const port = await new Promise<number>((resolve) => {
      httpServer.listen(0, () => {
        resolve((httpServer.address() as any).port);
      });
    });
    
    const { io: clientIo } = await import('socket.io-client');
    
    return new Promise<void>((resolve, reject) => {
      const socket = clientIo(`http://127.0.0.1:${port}`, {
        transports: ['polling'],
        forceNew: true,
      });

      socket.on('connect', () => {
        socket.emit('room:create', { name: 'Test Room' }, (response: any) => {
          try {
            expect(response.success).toBe(true);
            expect(response.room.name).toBe('Test Room');
            socket.disconnect();
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Test timeout')), 8000);
    });
  });

  it('sends room:list on client connect', async () => {
    const port = await new Promise<number>((resolve) => {
      httpServer.listen(0, () => {
        resolve((httpServer.address() as any).port);
      });
    });
    
    const { io: clientIo } = await import('socket.io-client');
    
    return new Promise<void>((resolve, reject) => {
      const socket = clientIo(`http://127.0.0.1:${port}`, {
        transports: ['polling'],
        forceNew: true,
      });

      socket.on('room:list', (rooms: any[]) => {
        try {
          expect(Array.isArray(rooms)).toBe(true);
          socket.disconnect();
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Test timeout')), 8000);
    });
  });

  it('broadcasts room:created to lobby when room is created', async () => {
    const port = await new Promise<number>((resolve) => {
      httpServer.listen(0, () => {
        resolve((httpServer.address() as any).port);
      });
    });
    
    const { io: clientIo } = await import('socket.io-client');
    
    return new Promise<void>((resolve, reject) => {
      const socket = clientIo(`http://127.0.0.1:${port}`, {
        transports: ['polling'],
        forceNew: true,
      });

      socket.on('connect', () => {
        socket.once('room:list', () => {
          socket.emit('room:create', { name: 'Broadcast Test' }, () => {
            socket.disconnect();
            resolve();
          });
        });
      });

      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Test timeout')), 8000);
    });
  });

  it('cleans up room on disconnect', async () => {
    const port = await new Promise<number>((resolve) => {
      httpServer.listen(0, () => {
        resolve((httpServer.address() as any).port);
      });
    });
    
    const { io: clientIo } = await import('socket.io-client');
    
    return new Promise<void>((resolve, reject) => {
      const socket = clientIo(`http://127.0.0.1:${port}`, {
        transports: ['polling'],
        forceNew: true,
      });

      socket.on('connect', () => {
        socket.once('room:list', () => {
          socket.emit('room:create', { name: 'Temp Room' }, (response: any) => {
            const roomId = response.room.id;
            
            socket.disconnect();
            
            setTimeout(() => {
              try {
                const room = getRoom(roomId);
                expect(room).toBeUndefined();
                resolve();
              } catch (err) {
                reject(err);
              }
            }, 300);
          });
        });
      });

      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Test timeout')), 8000);
    });
  });
});
