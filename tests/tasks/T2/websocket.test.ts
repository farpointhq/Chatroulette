import WebSocket from 'ws';
import http from 'http';
import { createServer, startServer } from '../../src/server';

describe('WebSocket Server Setup', () => {
  let server: http.Server;
  let wss: WebSocket.Server;
  let port: number;

  beforeAll(async () => {
    const result = startServer(0); // random available port
    server = result.server;
    wss = result.wss;
    port = (server.address() as any).port;
  });

  afterAll((done) => {
    if (wss) wss.close();
    if (server) server.close(done);
    else done();
  });

  afterEach(() => {
    // Clean up any remaining WebSocket connections
    if (wss) {
      wss.clients.forEach((client) => {
        client.close();
      });
    }
  });

  test('should create a WebSocket server', () => {
    expect(wss).toBeDefined();
    expect(wss instanceof WebSocket.Server).toBe(true);
  });

  test('should accept WebSocket connections', (done) => {
    const client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      expect(client.readyState).toBe(WebSocket.OPEN);
      client.close();
      done();
    });

    client.on('error', (err) => {
      done(err);
    });
  });

  test('should handle client disconnection gracefully', (done) => {
    const client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      client.close();
    });

    client.on('close', () => {
      expect(client.readyState).toBe(WebSocket.CLOSED);
      done();
    });

    client.on('error', (err) => {
      done(err);
    });
  });

  test('should support multiple simultaneous connections', (done) => {
    const clients: WebSocket[] = [];
    const numClients = 3;
    let connected = 0;

    for (let i = 0; i < numClients; i++) {
      const client = new WebSocket(`ws://localhost:${port}`);
      clients.push(client);

      client.on('open', () => {
        connected++;
        if (connected === numClients) {
          expect(wss.clients.size).toBe(numClients);
          clients.forEach((c) => c.close());
          done();
        }
      });

      client.on('error', (err) => {
        done(err);
      });
    }
  });

  test('should broadcast messages to all connected clients', (done) => {
    const clients: WebSocket[] = [];
    const numClients = 2;
    let receivedCount = 0;

    for (let i = 0; i < numClients; i++) {
      const client = new WebSocket(`ws://localhost:${port}`);
      clients.push(client);

      client.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'broadcast') {
          receivedCount++;
          if (receivedCount === numClients) {
            clients.forEach((c) => c.close());
            done();
          }
        }
      });
    }

    // Wait for all clients to connect, then broadcast
    setTimeout(() => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'broadcast', data: 'test' }));
        }
      });
    }, 100);
  });

  test('should handle ping/pong for connection keepalive', (done) => {
    const client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      client.ping();
    });

    client.on('pong', () => {
      client.close();
      done();
    });

    client.on('error', (err) => {
      done(err);
    });
  });
});
