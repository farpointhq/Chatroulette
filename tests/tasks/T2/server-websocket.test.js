import { describe, it } from 'node:test';
import assert from 'node:assert';
import WebSocket from 'ws';
import { createServer, startServer } from '../../../server/src/index.js';
import { createWebSocketServer, broadcast, getConnectedClients, closeConnection } from '../../../server/src/websocket.js';

describe('WebSocket Server Setup', () => {
  it('createWebSocketServer should create a WebSocket.Server instance', () => {
    const { server } = startServer(0);
    const wss = createWebSocketServer(server);
    assert.ok(wss, 'createWebSocketServer should return a wss object');
    assert.ok(wss instanceof WebSocket.Server || wss.constructor.name === 'WebSocketServer', 'should be a WebSocket server');
    server.close();
    wss.close();
  });

  it('should accept WebSocket connections', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const client = new WebSocket(`ws://localhost:${port}`);
    await new Promise((resolve, reject) => {
      client.on('open', () => {
        assert.strictEqual(client.readyState, WebSocket.OPEN, 'client should be OPEN');
        client.close();
        resolve();
      });
      client.on('error', reject);
    });

    server.close();
    wss.close();
  });

  it('should handle client disconnection gracefully', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const client = new WebSocket(`ws://localhost:${port}`);
    await new Promise((resolve, reject) => {
      client.on('open', () => {
        client.close();
      });
      client.on('close', () => {
        assert.strictEqual(client.readyState, WebSocket.CLOSED, 'client should be CLOSED');
        resolve();
      });
      client.on('error', reject);
    });

    server.close();
    wss.close();
  });

  it('should support multiple simultaneous connections', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const clients = [];
    const numClients = 3;

    for (let i = 0; i < numClients; i++) {
      clients.push(new WebSocket(`ws://localhost:${port}`));
    }

    await Promise.all(
      clients.map(
        (client) =>
          new Promise((resolve, reject) => {
            client.on('open', resolve);
            client.on('error', reject);
          })
      )
    );

    assert.strictEqual(wss.clients.size, numClients, `should have ${numClients} connected clients`);

    clients.forEach((c) => c.close());
    server.close();
    wss.close();
  });

  it('getConnectedClients should return the number of connected clients', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const client = new WebSocket(`ws://localhost:${port}`);
    await new Promise((resolve, reject) => {
      client.on('open', resolve);
      client.on('error', reject);
    });

    const count = getConnectedClients(wss);
    assert.strictEqual(count, 1, 'should have 1 connected client');

    client.close();
    server.close();
    wss.close();
  });

  it('broadcast should send a message to all connected clients', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const clients = [];
    const messages = [];

    for (let i = 0; i < 2; i++) {
      const client = new WebSocket(`ws://localhost:${port}`);
      clients.push(client);
      client.on('message', (data) => {
        messages.push(JSON.parse(data.toString()));
      });
    }

    await Promise.all(
      clients.map(
        (client) =>
          new Promise((resolve, reject) => {
            client.on('open', resolve);
            client.on('error', reject);
          })
      )
    );

    broadcast(wss, { type: 'broadcast', data: 'test' });

    // Wait a tick for messages to arrive
    await new Promise((r) => setTimeout(r, 50));

    assert.strictEqual(messages.length, 2, 'both clients should receive the broadcast');
    assert.deepStrictEqual(messages[0], { type: 'broadcast', data: 'test' });
    assert.deepStrictEqual(messages[1], { type: 'broadcast', data: 'test' });

    clients.forEach((c) => c.close());
    server.close();
    wss.close();
  });

  it('broadcast with filter should only send to matching clients', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const client1 = new WebSocket(`ws://localhost:${port}`);
    const client2 = new WebSocket(`ws://localhost:${port}`);
    const messages1 = [];
    const messages2 = [];

    client1.on('message', (data) => messages1.push(JSON.parse(data.toString())));
    client2.on('message', (data) => messages2.push(JSON.parse(data.toString())));

    await Promise.all([
      new Promise((resolve, reject) => { client1.on('open', resolve); client1.on('error', reject); }),
      new Promise((resolve, reject) => { client2.on('open', resolve); client2.on('error', reject); }),
    ]);

    // Mark client1 with metadata so filter can distinguish
    client1.roomId = 'room-a';
    client2.roomId = 'room-b';

    broadcast(wss, { type: 'room-msg', data: 'hello' }, (ws) => ws.roomId === 'room-a');

    await new Promise((r) => setTimeout(r, 50));

    assert.strictEqual(messages1.length, 1, 'client1 in room-a should receive the message');
    assert.strictEqual(messages2.length, 0, 'client2 in room-b should NOT receive the message');

    client1.close();
    client2.close();
    server.close();
    wss.close();
  });

  it('closeConnection should terminate a WebSocket connection', async () => {
    const { server, wss } = startServer(0);
    const address = server.address();
    const port = address.port;

    const client = new WebSocket(`ws://localhost:${port}`);
    await new Promise((resolve, reject) => {
      client.on('open', resolve);
      client.on('error', reject);
    });

    // Find the server-side socket for this client
    const serverWs = Array.from(wss.clients)[0];
    closeConnection(serverWs, 1000, 'test close');

    await new Promise((resolve) => {
      client.on('close', resolve);
    });

    assert.strictEqual(client.readyState, WebSocket.CLOSED, 'client should be closed');

    server.close();
    wss.close();
  });
});
