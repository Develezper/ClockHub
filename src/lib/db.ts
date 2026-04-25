import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const bun = (globalThis as typeof globalThis & { Bun?: { env?: Record<string, string | undefined> } }).Bun;
const nodeEnv = bun?.env?.NODE_ENV ?? "development";

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (nodeEnv !== "production") {
  globalForPrisma.prisma = db;
}
