import { Router } from 'express';
import { login } from './auth.controller';
import { validateBody } from '@/middlewares/validate';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', validateBody(loginSchema), login);

export default router;
