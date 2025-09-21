import { prisma } from '@/utils/prisma';
import { verifyPassword } from '@/utils/password';
import { signToken } from '@/utils/jwt';
import { logger } from '@/config/logger';

export interface LoginInput {
  email: string;
  password: string;
}

export const AuthService = {
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn({ email }, 'Login failed: user not found');
      throw Object.assign(new Error('Invalid credentials'), { status: 401, name: 'AUTH_INVALID' });
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      logger.warn({ email }, 'Login failed: invalid password');
      throw Object.assign(new Error('Invalid credentials'), { status: 401, name: 'AUTH_INVALID' });
    }

    const token = signToken({ userId: user.id, orgId: user.orgId, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        role: user.role
      }
    };
  }
};
