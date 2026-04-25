const BUN_PASSWORD_COST = 12;

function ensureBunRuntime(): void {
  const bun = (globalThis as typeof globalThis & { Bun?: { password?: unknown } }).Bun;
  if (!bun?.password) {
    throw new Error("Bun runtime is required for password hashing");
  }
}

export async function hashPassword(password: string): Promise<string> {
  ensureBunRuntime();
  const bun = (globalThis as typeof globalThis & {
    Bun: {
      password: {
        hash: (password: string, options?: { algorithm?: "bcrypt"; cost?: number }) => Promise<string>;
      };
    };
  }).Bun;
  return bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: BUN_PASSWORD_COST,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  ensureBunRuntime();
  const bun = (globalThis as typeof globalThis & {
    Bun: {
      password: {
        verify: (password: string, hash: string) => Promise<boolean>;
      };
    };
  }).Bun;
  return bun.password.verify(password, hash);
}
