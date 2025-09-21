import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
