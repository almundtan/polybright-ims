import { Router } from 'express';
import { health, metrics, ready } from './health.controller';

const router = Router();

router.get('/healthz', health);
router.get('/readyz', ready);
router.get('/metrics', metrics);

export default router;
