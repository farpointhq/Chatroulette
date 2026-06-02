import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import http from "node:http";
import WebSocket from "ws";
import { createServer, startServer, stopServer } from "../../../server/src/index.js";
import { createWebSocketServer, broadcast, getConnectedClients, closeConnection } from "../../../server/src/websocket.js";
import { handleConnection, handleMessage, handleDisconnect, setConnectionMetadata, getConnectionMetadata } from "../../../server/src/connection.js";

// Use ephemeral ports to avoid conflicts
const TEST_PORT = 0;
const HEALTH_PATH = "/health";
const WS_PATH = "/ws";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function httpGet(path, port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
  });
}

describe("Server scaffolding & WebSocket setup", () => {
  describe("createServer", () => {
    it("should create an HTTP server", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      assert.ok(httpServer, "httpServer should be defined");
      assert.ok(httpServer instanceof http.Server, "httpServer should be an http.Server instance");
      await stopServer(httpServer);
    });

    it("should create a WebSocket server", async () => {
      const { wsServer } = await createServer(TEST_PORT);
      assert.ok(wsServer, "wsServer should be defined");
      await stopServer(wsServer.httpServer || wsServer);
    });

    it("should listen on the provided port", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      const address = httpServer.address();
      assert.ok(address, "server should have an address");
      assert.ok(address.port > 0, "port should be assigned");
      await stopServer(httpServer);
    });

    it("should expose server address info", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const address = httpServer.address();
      assert.ok(address, "address should be defined");
      assert.strictEqual(typeof address.port, "number");
      await stopServer(httpServer);
    });
  });

  describe("startServer", () => {
    it("should start an HTTP server on a specific port", async () => {
      const { httpServer, wsServer } = await startServer(0);
      const address = httpServer.address();
      assert.ok(address.port > 0, "server should be listening on a port");
      await stopServer(httpServer);
    });

    it("should return both httpServer and wsServer", async () => {
      const result = await startServer(0);
      assert.ok(result.httpServer, "should return httpServer");
      assert.ok(result.wsServer, "should return wsServer");
      await stopServer(result.httpServer);
    });

    it("should reject when port is already in use", async () => {
      const blocker = http.createServer().listen(0);
      const usedPort = blocker.address().port;
      try {
        await assert.rejects(
          startServer(usedPort),
          /EADDRINUSE|in use|already in use/i,
          "should reject with port-in-use error"
        );
      } finally {
        blocker.close();
        await wait(50);
      }
    });
  });

  describe("stopServer", () => {
    it("should close the HTTP server", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      await stopServer(httpServer);
      assert.strictEqual(httpServer.listening, false, "server should not be listening after stop");
    });

    it("should close all active WebSocket connections", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const ws = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await new Promise((resolve) => ws.once("open", resolve));
      assert.strictEqual(ws.readyState, WebSocket.OPEN, "client should be connected");
      await stopServer(httpServer);
      await wait(100);
      assert.notStrictEqual(ws.readyState, WebSocket.OPEN, "client should be closed after stopServer");
    });

    it("should be idempotent (safe to call multiple times)", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      await stopServer(httpServer);
      await assert.doesNotReject(stopServer(httpServer), "second stopServer should not throw");
    });
  });

  describe("health check endpoint", () => {
    it("should respond 200 OK on GET /health", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const res = await httpGet("/health", port);
      assert.strictEqual(res.status, 200, "health check should return 200");
      await stopServer(httpServer);
    });

    it("should return JSON with status 'ok'", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const res = await httpGet("/health", port);
      const body = JSON.parse(res.body);
      assert.strictEqual(body.status, "ok", "status should be 'ok'");
      await stopServer(httpServer);
    });
  });

  describe("WebSocket upgrade endpoint", () => {
    it("should accept WebSocket connections at /ws", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const ws = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await new Promise((resolve, reject) => {
        ws.once("open", resolve);
        ws.once("error", reject);
      });
      assert.strictEqual(ws.readyState, WebSocket.OPEN);
      ws.close();
      await wait(50);
      await stopServer(httpServer);
    });

    it("should reject WebSocket connections on other paths", async () => {
      const { httpServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const ws = new WebSocket(`ws://127.0.0.1:${port}/not-ws`);
      await new Promise((resolve) => {
        ws.once("error", resolve);
        ws.once("close", resolve);
      });
      assert.notStrictEqual(ws.readyState, WebSocket.OPEN);
      await stopServer(httpServer);
    });
  });

  describe("createWebSocketServer", () => {
    it("should create a WebSocket.Server instance attached to an HTTP server", async () => {
      const httpServer = http.createServer();
      httpServer.listen(0);
      await new Promise((resolve) => httpServer.once("listening", resolve));
      const wsServer = createWebSocketServer(httpServer, WS_PATH);
      assert.ok(wsServer, "wsServer should be defined");
      assert.ok(wsServer.clients, "wsServer should have clients Set");
      httpServer.close();
      await wait(50);
    });
  });

  describe("broadcast", () => {
    it("should send a message to all connected clients when no filter", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const ws1 = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      const ws2 = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await Promise.all([
        new Promise((r) => ws1.once("open", r)),
        new Promise((r) => ws2.once("open", r)),
      ]);

      const msg = { type: "ping" };
      const received1 = new Promise((resolve) => ws1.once("message", (data) => resolve(JSON.parse(data.toString()))));
      const received2 = new Promise((resolve) => ws2.once("message", (data) => resolve(JSON.parse(data.toString()))));
      broadcast(wsServer, msg);

      const [r1, r2] = await Promise.all([received1, received2]);
      assert.deepStrictEqual(r1, msg);
      assert.deepStrictEqual(r2, msg);

      ws1.close();
      ws2.close();
      await wait(50);
      await stopServer(httpServer);
    });

    it("should filter clients when filterFn is provided", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const ws1 = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      const ws2 = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await Promise.all([
        new Promise((r) => ws1.once("open", r)),
        new Promise((r) => ws2.once("open", r)),
      ]);

      // tag one client
      setConnectionMetadata(ws1, { playerId: "p1" });
      setConnectionMetadata(ws2, { playerId: "p2" });

      const msg = { type: "targeted" };
      const received = new Promise((resolve, reject) => {
        ws2.once("message", () => reject(new Error("ws2 should not receive")));
        ws1.once("message", (data) => resolve(JSON.parse(data.toString())));
        setTimeout(() => reject(new Error("timeout waiting for message")), 500);
      });

      broadcast(wsServer, msg, (client) => getConnectionMetadata(client)?.playerId === "p1");

      const r = await received;
      assert.deepStrictEqual(r, msg);

      ws1.close();
      ws2.close();
      await wait(50);
      await stopServer(httpServer);
    });
  });

  describe("getConnectedClients", () => {
    it("should return the number of connected clients", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      assert.strictEqual(getConnectedClients(wsServer), 0, "initially 0 clients");

      const ws1 = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await new Promise((r) => ws1.once("open", r));
      await wait(50);
      assert.strictEqual(getConnectedClients(wsServer), 1, "should be 1 client");

      const ws2 = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await new Promise((r) => ws2.once("open", r));
      await wait(50);
      assert.strictEqual(getConnectedClients(wsServer), 2, "should be 2 clients");

      ws1.close();
      ws2.close();
      await wait(100);
      await stopServer(httpServer);
    });
  });

  describe("closeConnection", () => {
    it("should close a specific WebSocket connection", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      const ws = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      await new Promise((r) => ws.once("open", r));

      const closed = new Promise((resolve) => ws.once("close", resolve));
      closeConnection(ws, 1000, "test close");
      await closed;
      assert.strictEqual(ws.readyState, WebSocket.CLOSED);
      await stopServer(httpServer);
    });
  });

  describe("handleConnection", () => {
    it("should be called when a new WebSocket connects", async () => {
      const { httpServer, wsServer } = await createServer(TEST_PORT);
      const port = httpServer.address().port;
      // The stub should throw, confirming it was wired up
      const ws = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
      // We expect the connection handler to be invoked; since it's stubbed,
      // it may throw. We just verify the server still functions.
      await new Promise((resolve, reject) => {
        ws.once("open", resolve);
        ws.once("error", reject);
      });
      ws.close();
      await wait(50);
      await stopServer(httpServer);
    });
  });

  describe("handleMessage", () => {
    it("should process incoming messages", async () => {
      const wsMock = { readyState: WebSocket.OPEN, send: () => {}, close: () => {} };
      // Stub currently throws — this test verifies the function signature exists
      assert.throws(() => handleMessage(wsMock, '{"type":"test"}'), /Not implemented/);
    });
  });

  describe("handleDisconnect", () => {
    it("should handle client disconnect", async () => {
      const wsMock = { readyState: WebSocket.CLOSED };
      assert.throws(() => handleDisconnect(wsMock, 1000, "gone"), /Not implemented/);
    });
  });

  describe("setConnectionMetadata / getConnectionMetadata", () => {
    it("should store and retrieve metadata on a WebSocket", () => {
      const wsMock = {};
      setConnectionMetadata(wsMock, { playerId: "abc123", color: "white" });
      const meta = getConnectionMetadata(wsMock);
      assert.deepStrictEqual(meta, { playerId: "abc123", color: "white" });
    });

    it("should return undefined when no metadata is set", () => {
      const wsMock = {};
      const meta = getConnectionMetadata(wsMock);
      assert.strictEqual(meta, undefined);
    });
  });

  describe("logging", () => {
    it("should log startup event when server starts", async () => {
      const logs = [];
      const origLog = console.log;
      console.log = (...args) => logs.push(args.join(" "));
      try {
        const { httpServer } = await startServer(0);
        await stopServer(httpServer);
        const startupLog = logs.find((l) => /server|listen|startup/i.test(l));
        assert.ok(startupLog, `expected startup log, got: ${logs.join(" | ")}`);
      } finally {
        console.log = origLog;
      }
    });

    it("should log connection event when a client connects", async () => {
      const logs = [];
      const origLog = console.log;
      console.log = (...args) => logs.push(args.join(" "));
      try {
        const { httpServer } = await createServer(TEST_PORT);
        const port = httpServer.address().port;
        const ws = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
        await new Promise((r) => ws.once("open", r));
        await wait(50);
        ws.close();
        await wait(50);
        await stopServer(httpServer);
        const connLog = logs.find((l) => /connect|client|joined/i.test(l));
        assert.ok(connLog, `expected connection log, got: ${logs.join(" | ")}`);
      } finally {
        console.log = origLog;
      }
    });

    it("should log disconnection event when a client disconnects", async () => {
      const logs = [];
      const origLog = console.log;
      console.log = (...args) => logs.push(args.join(" "));
      try {
        const { httpServer } = await createServer(TEST_PORT);
        const port = httpServer.address().port;
        const ws = new WebSocket(`ws://127.0.0.1:${port}${WS_PATH}`);
        await new Promise((r) => ws.once("open", r));
        ws.close();
        await wait(100);
        await stopServer(httpServer);
        const discLog = logs.find((l) => /disconnect|close|left/i.test(l));
        assert.ok(discLog, `expected disconnection log, got: ${logs.join(" | ")}`);
      } finally {
        console.log = origLog;
      }
    });
  });
});
