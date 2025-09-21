import { Router } from 'express';
import { productRoutes } from '@/modules/products';
import { warehouseRoutes } from '@/modules/warehouses';
import { inventoryRoutes } from '@/modules/inventory';
import { adjustmentRoutes } from '@/modules/stock';
import { purchaseOrderRoutes, salesOrderRoutes, transferRoutes } from '@/modules/orders';
import { syncRoutes } from '@/modules/sync';
import { reportRoutes } from '@/modules/reports';

const router = Router();

router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/stock-adjustments', adjustmentRoutes);
router.use('/pos', purchaseOrderRoutes);
router.use('/sos', salesOrderRoutes);
router.use('/transfers', transferRoutes);
router.use('/sync', syncRoutes);
router.use('/reports', reportRoutes);

export default router;
