import { Router } from 'express';
import { z } from 'zod';
import { createAdjustment } from './adjustment.controller';
import { validateBody } from '@/middlewares/validate';

const router = Router();

const schema = z.object({
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number(),
  reason: z.string().min(1)
});

router.post('/', validateBody(schema), createAdjustment);

export default router;
