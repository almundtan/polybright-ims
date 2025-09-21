import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '@/utils/jwt';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, orgId: payload.orgId, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token', code: 'AUTH_INVALID' });
  }
};
