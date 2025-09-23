type HashFn = typeof import('@node-rs/argon2').hash;
type VerifyFn = typeof import('@node-rs/argon2').verify;

type Argon2Module = {
  hash: HashFn;
  verify: VerifyFn;
};

const loadArgon2 = (): Argon2Module => {
  const loadErrors: Error[] = [];

  for (const moduleName of ['@node-rs/argon2', 'argon2']) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      return require(moduleName) as Argon2Module;
    } catch (error) {
      loadErrors.push(error as Error);
    }
  }

  const details = loadErrors.map((error) => error.message).join('; ');
  throw new Error(
    `Failed to load an argon2 implementation. Install @node-rs/argon2 or argon2. Details: ${details}`
  );
};

const { hash, verify } = loadArgon2();

export const hashPassword = async (plain: string) =>
  hash(plain, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });

export const verifyPassword = async (hashValue: string, plain: string) => verify(hashValue, plain);
