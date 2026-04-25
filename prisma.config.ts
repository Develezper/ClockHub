import { defineConfig } from "prisma/config";

const bun = (globalThis as typeof globalThis & { Bun?: { env?: Record<string, string | undefined> } }).Bun;
const databaseUrl = bun?.env?.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
