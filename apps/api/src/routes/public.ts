import { Router } from 'express';
import { authRoutes } from '@/modules/auth';
import { healthRoutes } from '@/modules/health';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);

export default router;
