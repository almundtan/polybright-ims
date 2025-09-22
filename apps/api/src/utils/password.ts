import { hash, verify } from '@node-rs/argon2';

export const hashPassword = async (plain: string) =>
  hash(plain, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });

export const verifyPassword = async (hashValue: string, plain: string) => verify(hashValue, plain);
