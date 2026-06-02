import { Router } from 'express';

export function createHealthRouter(): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });
  return router;
}
