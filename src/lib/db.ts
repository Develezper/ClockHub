import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const nodeEnv = process.env.NODE_ENV ?? "development";

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (nodeEnv !== "production") {
  globalForPrisma.prisma = db;
}
