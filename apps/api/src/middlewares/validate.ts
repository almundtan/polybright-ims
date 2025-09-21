import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: unknown) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error instanceof Error ? error.message : error
      });
    }
  };

export const validateQuery = <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: unknown) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error instanceof Error ? error.message : error
      });
    }
  };
