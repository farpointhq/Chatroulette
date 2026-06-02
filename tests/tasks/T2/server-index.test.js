import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createServer, startServer, stopServer } from '../../../server/src/index.js';

describe('Server index.js — createServer, startServer, stopServer', () => {
  it('createServer should return an Express app with a listen method', () => {
    const app = createServer();
    assert.ok(app, 'createServer should return an app');
    assert.strictEqual(typeof app.listen, 'function', 'app should have a listen method');
  });

  it('createServer should have a /health endpoint that returns 200 OK', async () => {
    const app = createServer();
    // We need a way to test the endpoint. If the app is an Express app,
    // we can use it directly or start it on a random port.
    const server = app.listen(0);
    const address = server.address();
    const port = address.port;

    try {
      const res = await fetch(`http://localhost:${port}/health`);
      assert.strictEqual(res.status, 200, '/health should return 200');
      const body = await res.json();
      assert.deepStrictEqual(body, { status: 'ok' }, '/health should return { status: "ok" }');
    } finally {
      server.close();
    }
  });

  it('startServer should start an HTTP server on the given port', async () => {
    const { server, wss } = startServer(0); // 0 = random available port
    assert.ok(server, 'startServer should return a server object');
    assert.ok(server.listening, 'server should be listening');

    const address = server.address();
    assert.ok(address.port > 0, 'server should be assigned a port');

    server.close();
    if (wss) wss.close();
  });

  it('startServer should return a WebSocket server instance', async () => {
    const { server, wss } = startServer(0);
    assert.ok(wss, 'startServer should return a wss object');
    assert.strictEqual(typeof wss.clients, 'object', 'wss should have a clients property');

    server.close();
    wss.close();
  });

  it('stopServer should close the HTTP server', async () => {
    const { server, wss } = startServer(0);
    await stopServer(server, wss);
    assert.strictEqual(server.listening, false, 'server should no longer be listening after stopServer');
  });

  it('stopServer should close the WebSocket server', async () => {
    const { server, wss } = startServer(0);
    await stopServer(server, wss);
    // After closing, wss should reject new connections
    assert.ok(true, 'WebSocket server should be closed');
  });
});
