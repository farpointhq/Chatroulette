import { describe, it, expect } from 'vitest';
import { createHealthRouter } from './health.js';
import type { Request, Response } from 'express';

describe('health middleware', () => {
  it('returns ok status with uptime', () => {
    const router = createHealthRouter();
    
    // Find the GET route handler
    const getRoute = router.stack.find(
      (layer: any) => layer.route?.methods?.get
    );
    expect(getRoute).toBeDefined();

    const handler = getRoute.route.stack[0].handle;
    const req = {} as Request;
    const res = {
      json: (data: any) => {
        expect(data.status).toBe('ok');
        expect(typeof data.uptime).toBe('number');
        expect(data.uptime).toBeGreaterThanOrEqual(0);
      },
    } as unknown as Response;

    handler(req, res, () => {});
  });
});
