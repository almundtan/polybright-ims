import { Router } from 'express';
import { z } from 'zod';
import { pullSync, pushSync } from './sync.controller';
import { validateBody, validateQuery } from '@/middlewares/validate';

const router = Router();

const pushSchema = z.object({
  clientId: z.string().min(1),
  lastSyncedAt: z.string().optional().default(new Date(0).toISOString()),
  mutations: z.array(
    z.object({
      type: z.string(),
      payload: z.unknown()
    })
  )
});

const pullSchema = z.object({
  since: z.string().optional()
});

router.post('/push', validateBody(pushSchema), pushSync);
router.get('/pull', validateQuery(pullSchema), pullSync);

export default router;
