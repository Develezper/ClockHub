import "dotenv/config";
import { defineConfig } from "prisma/config";

const directUrl = process.env.DIRECT_URL;
const databaseUrl = directUrl || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL (or DIRECT_URL)");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
