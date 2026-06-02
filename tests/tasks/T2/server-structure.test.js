import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const serverRoot = path.join(projectRoot, 'server');

describe('Server project structure', () => {
  it('should have a server/ directory', () => {
    assert.ok(fs.existsSync(serverRoot), 'server/ directory should exist');
    assert.ok(fs.statSync(serverRoot).isDirectory(), 'server/ should be a directory');
  });

  it('should have a server/package.json file', () => {
    const pkgPath = path.join(serverRoot, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'server/package.json should exist');
  });

  it('should have server/src/index.js as entry point', () => {
    const indexPath = path.join(serverRoot, 'src', 'index.js');
    assert.ok(fs.existsSync(indexPath), 'server/src/index.js should exist');
  });

  it('should have server/src/websocket.js for WebSocket handling', () => {
    const wsPath = path.join(serverRoot, 'src', 'websocket.js');
    assert.ok(fs.existsSync(wsPath), 'server/src/websocket.js should exist');
  });

  it('should have server/src/connection.js for connection management', () => {
    const connPath = path.join(serverRoot, 'src', 'connection.js');
    assert.ok(fs.existsSync(connPath), 'server/src/connection.js should exist');
  });

  it('should have a Dockerfile at project root', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile');
    assert.ok(fs.existsSync(dockerfilePath), 'Dockerfile should exist at project root');
  });

  it('should have .env.example file', () => {
    const envExamplePath = path.join(projectRoot, '.env.example');
    const envPath = path.join(projectRoot, '.env');
    const hasEnvExample = fs.existsSync(envExamplePath);
    const hasEnv = fs.existsSync(envPath);
    assert.ok(hasEnvExample || hasEnv, '.env.example or .env should exist');
  });

  it('should have express in server dependencies', () => {
    const pkgPath = path.join(serverRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.ok(pkg.dependencies?.express, 'express should be in server dependencies');
  });

  it('should have ws (WebSocket) in server dependencies', () => {
    const pkgPath = path.join(serverRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.ok(pkg.dependencies?.ws, 'ws should be in server dependencies');
  });

  it('should have dotenv in server dependencies', () => {
    const pkgPath = path.join(serverRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.ok(pkg.dependencies?.dotenv, 'dotenv should be in server dependencies');
  });

  it('should have cors in server dependencies', () => {
    const pkgPath = path.join(serverRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    assert.ok(pkg.dependencies?.cors, 'cors should be in server dependencies');
  });
});
