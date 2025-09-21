import { NextFunction, Request, Response } from 'express';
import { logger } from '@/config/logger';

type AppError = Error & { status?: number; details?: unknown };

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  const payload = {
    error: err.message ?? 'Internal Server Error',
    code: err.name ?? 'InternalError',
    details: err.details,
    requestId: req.requestId
  };

  logger.error({ ...payload, stack: err.stack });

  res.status(status).json(payload);
};
