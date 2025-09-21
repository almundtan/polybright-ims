import { Router } from 'express';
import { z } from 'zod';
import {
  createWarehouse,
  deleteWarehouse,
  listWarehouses,
  updateWarehouse
} from './warehouse.controller';
import { validateBody } from '@/middlewares/validate';

const router = Router();

const schema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional()
});

router.get('/', listWarehouses);
router.post('/', validateBody(schema), createWarehouse);
router.put('/:id', validateBody(schema.partial()), updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;
