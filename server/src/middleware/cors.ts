import type { Request, Response, NextFunction } from 'express';
import { loadConfig } from '../config.js';

export function createCorsMiddleware() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const config = loadConfig();
    res.header('Access-Control-Allow-Origin', config.corsOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  };
}
