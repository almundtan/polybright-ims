import { Router } from 'express';
import { z } from 'zod';
import { createTransfer } from './transfer.controller';
import { validateBody } from '@/middlewares/validate';

const router = Router();

const lineSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().positive()
});

const transferSchema = z.object({
  fromWarehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid(),
  lines: z.array(lineSchema).min(1)
});

router.post('/', validateBody(transferSchema), createTransfer);

export default router;
