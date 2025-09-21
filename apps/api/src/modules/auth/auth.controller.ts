import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login({ email, password });
  res.cookie('token', result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json(result);
};
