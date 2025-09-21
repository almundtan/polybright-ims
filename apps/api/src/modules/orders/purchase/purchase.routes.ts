import { Router } from 'express';
import { z } from 'zod';
import { createPO, listPOs, receivePO, updatePO } from './purchase.controller';
import { validateBody } from '@/middlewares/validate';

const router = Router();

const itemSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().positive(),
  unitPricePhp: z.number().nonnegative()
});

const baseSchema = z.object({
  supplierName: z.string().min(1),
  items: z.array(itemSchema).min(1)
});

router.get('/', listPOs);
router.post('/', validateBody(baseSchema), createPO);
router.put('/:id', validateBody(baseSchema), updatePO);
router.post('/:id/receive', validateBody(z.object({ warehouseId: z.string().uuid() })), receivePO);

export default router;
