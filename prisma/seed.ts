import { Role, UserStatus } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

function getEnv(key: string): string | undefined {
  const bun = (globalThis as typeof globalThis & { Bun?: { env?: Record<string, string | undefined> } }).Bun;
  return bun?.env?.[key] ?? process.env[key];
}

async function main() {
  const adminEmail = getEnv("ADMIN_EMAIL");
  const adminPassword = getEnv("ADMIN_PASSWORD");

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL o ADMIN_PASSWORD no definidos; se omite seed de admin");
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Administrador",
      email: adminEmail.toLowerCase(),
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
