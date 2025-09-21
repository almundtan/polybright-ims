import 'express-async-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { requestContext } from '@/middlewares/requestContext';
import { errorHandler } from '@/middlewares/errorHandler';
import publicRoutes from '@/routes/public';
import protectedRoutes from '@/routes/protected';
import { requireAuth } from '@/middlewares/auth';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.ORIGIN ?? 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(requestContext);
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ request_id: req.requestId, userId: req.user?.id, orgId: req.user?.orgId })
  })
);

app.use('/api', publicRoutes);
app.use('/api', requireAuth, protectedRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

export default app;
