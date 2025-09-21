import argon2 from 'argon2';

export const hashPassword = async (plain: string) => argon2.hash(plain);
export const verifyPassword = async (hash: string, plain: string) => argon2.verify(hash, plain);
