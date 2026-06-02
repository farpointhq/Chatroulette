import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { io as Client } from 'socket.io-client';
import { createApp, startServer, stopServer } from '../server.js';
import { clearRooms } from '../rooms.js';
import type { Server as HTTPServer } from 'http';
import type { Server as SocketIOServer } from 'socket.io';

describe('socket handlers', () => {
  let serverInfo: { httpServer: HTTPServer; io: SocketIOServer; port: number } | null = null;
  let clientSocket: ReturnType<typeof Client>;

  beforeEach(async () => {
    clearRooms();
  });

  afterEach(async () => {
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
    if (serverInfo) {
      await stopServer(serverInfo.httpServer, serverInfo.io);
      serverInfo = null;
    }
  });

  async function createClient(port: number) {
    return new Promise<ReturnType<typeof Client>>((resolve, reject) => {
      const socket = Client(`http://localhost:${port}`);
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }

  it('client connects and receives room list', async () => {
    serverInfo = await startServer(0);
    clientSocket = await createClient(serverInfo.port);

    const rooms = await new Promise<any[]>((resolve) => {
      clientSocket.on('room:list', (data: any[]) => {
        resolve(data);
      });
    });

    expect(Array.isArray(rooms)).toBe(true);
  });

  it('client can create a room', async () => {
    serverInfo = await startServer(0);
    clientSocket = await createClient(serverInfo.port);

    // Wait for room:list first
    await new Promise<void>((resolve) => {
      clientSocket.on('room:list', () => resolve());
    });

    const result = await new Promise<any>((resolve) => {
      clientSocket.emit('room:create', { name: 'Test Room' }, (response: any) => {
        resolve(response);
      });
    });

    expect(result.success).toBe(true);
    expect(result.room.name).toBe('Test Room');
  });

  it('client can join a room', async () => {
    serverInfo = await startServer(0);
    clientSocket = await createClient(serverInfo.port);

    // Wait for room:list
    await new Promise<void>((resolve) => {
      clientSocket.on('room:list', () => resolve());
    });

    // Create room
    const createResult = await new Promise<any>((resolve) => {
      clientSocket.emit('room:create', { name: 'Test Room' }, (response: any) => {
        resolve(response);
      });
    });

    // Join the room
    const joinResult = await new Promise<any>((resolve) => {
      clientSocket.emit('room:join', createResult.room.id, (response: any) => {
        resolve(response);
      });
    });

    expect(joinResult.success).toBe(true);
    expect(joinResult.room.id).toBe(createResult.room.id);
  });

  it('second client receives broadcast when player joins', async () => {
    serverInfo = await startServer(0);
    const client1 = await createClient(serverInfo.port);
    const client2 = await createClient(serverInfo.port);

    // Wait for both to get room:list
    await Promise.all([
      new Promise<void>((resolve) => client1.on('room:list', () => resolve())),
      new Promise<void>((resolve) => client2.on('room:list', () => resolve())),
    ]);

    // Client 1 creates room
    const createResult = await new Promise<any>((resolve) => {
      client1.emit('room:create', { name: 'Test Room' }, (response: any) => {
        resolve(response);
      });
    });

    // Client 2 listens for playerJoined
    const playerJoinedPromise = new Promise<any>((resolve) => {
      client1.on('room:playerJoined', (data: any) => {
        resolve(data);
      });
    });

    // Client 2 joins the room
    client2.emit('room:join', createResult.room.id, () => {});

    const event = await playerJoinedPromise;
    expect(event.playerId).toBeDefined();

    client1.disconnect();
    client2.disconnect();
  });

  it('disconnect cleans up empty rooms', async () => {
    serverInfo = await startServer(0);
    clientSocket = await createClient(serverInfo.port);

    // Wait for room:list
    await new Promise<void>((resolve) => {
      clientSocket.on('room:list', () => resolve());
    });

    // Create room
    const result = await new Promise<any>((resolve) => {
      clientSocket.emit('room:create', { name: 'Solo Room' }, (response: any) => {
        resolve(response);
      });
    });

    const roomId = result.room.id;

    // Disconnect
    clientSocket.disconnect();

    // Wait a bit for disconnect to process
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Create new client and verify room is gone
    const newClient = await createClient(serverInfo.port);
    const rooms = await new Promise<any[]>((resolve) => {
      newClient.on('room:list', (data: any[]) => {
        resolve(data);
      });
    });

    const foundRoom = rooms.find((r: any) => r.id === roomId);
    expect(foundRoom).toBeUndefined();

    newClient.disconnect();
  });
});
