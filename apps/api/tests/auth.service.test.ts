import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/modules/auth/auth.service';

vi.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(null)
    }
  }
}));

vi.mock('../src/utils/password', () => ({
  verifyPassword: vi.fn()
}));

vi.mock('../src/utils/jwt', () => ({
  signToken: vi.fn()
}));

vi.mock('../src/config/logger', () => ({
  logger: { warn: vi.fn() }
}));

describe('AuthService', () => {
  it('throws on invalid user', async () => {
    await expect(AuthService.login({ email: 'missing@example.com', password: 'x' })).rejects.toMatchObject({
      message: 'Invalid credentials'
    });
  });
});
