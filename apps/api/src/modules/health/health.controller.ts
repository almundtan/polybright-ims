import { Request, Response } from 'express';
import { prisma } from '@/utils/prisma';

export const health = (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
};

export const ready = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable', error });
  }
};

let requestCount = 0;

export const metrics = (_req: Request, res: Response) => {
  requestCount += 1;
  res.type('text/plain').send(`ims_request_count ${requestCount}`);
};
