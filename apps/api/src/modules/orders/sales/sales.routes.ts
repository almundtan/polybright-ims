import { Router } from 'express';
import { z } from 'zod';
import { createSO, fulfillSO, listSOs, updateSO } from './sales.controller';
import { validateBody } from '@/middlewares/validate';

const router = Router();

const itemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().positive(),
  unitPricePhp: z.number().nonnegative()
});

const baseSchema = z.object({
  customerName: z.string().min(1),
  items: z.array(itemSchema).min(1)
});

router.get('/', listSOs);
router.post('/', validateBody(baseSchema), createSO);
router.put('/:id', validateBody(baseSchema), updateSO);
router.post('/:id/fulfill', validateBody(z.object({ warehouseId: z.string().uuid() })), fulfillSO);

export default router;
