import { Router } from 'express';
import { z } from 'zod';
import {
  createProduct,
  deleteProduct,
  listProducts,
  productByBarcode,
  updateProduct
} from './product.controller';
import { validateBody, validateQuery } from '@/middlewares/validate';

const router = Router();

const upsertSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  uom: z.string().min(1)
});

const listSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional()
});

router.get('/', validateQuery(listSchema), listProducts);
router.post('/', validateBody(upsertSchema), createProduct);
router.put('/:id', validateBody(upsertSchema.partial()), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/by-barcode/:code', productByBarcode);

export default router;
