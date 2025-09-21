import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

interface TokenPayload {
  userId: string;
  orgId: string;
  role: string;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '12h' });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
