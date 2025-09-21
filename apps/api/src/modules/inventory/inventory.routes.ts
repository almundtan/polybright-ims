import { Router } from 'express';
import { z } from 'zod';
import { listInventory } from './inventory.controller';
import { validateQuery } from '@/middlewares/validate';

const router = Router();

const querySchema = z.object({
  warehouseId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional()
});

router.get('/', validateQuery(querySchema), listInventory);

export default router;
