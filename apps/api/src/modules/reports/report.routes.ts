import { Router } from 'express';
import { z } from 'zod';
import { ledgerReport } from './report.controller';
import { validateQuery } from '@/middlewares/validate';

const router = Router();

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
  productId: z.string().uuid().optional()
});

router.get('/ledger', validateQuery(querySchema), ledgerReport);

export default router;
