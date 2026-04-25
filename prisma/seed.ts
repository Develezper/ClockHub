import { AuditAction, Role, ScheduleStatus, UserStatus } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

type SeedConfig = {
  adminEmail?: string;
  adminPassword?: string;
  samplePassword?: string;
};

function getEnv(key: string): string | undefined {
  return process.env[key];
}

async function readSeedConfig(): Promise<SeedConfig | null> {
  try {
    const content = await readFile("prisma/seed.admin.json", "utf8");
    const parsed = JSON.parse(content) as SeedConfig;
    return parsed;
  } catch {
    return null;
  }
}

async function main() {
  const config = await readSeedConfig();

  const adminEmail = (config?.adminEmail ?? getEnv("ADMIN_EMAIL") ?? "admin@clockhub.local").toLowerCase();
  const adminPassword = config?.adminPassword ?? getEnv("ADMIN_PASSWORD") ?? "AdminClockHub1";
  const samplePassword = config?.samplePassword ?? getEnv("SEED_DEFAULT_PASSWORD") ?? adminPassword;

  const [adminHash, sampleHash] = await Promise.all([hashPassword(adminPassword), hashPassword(samplePassword)]);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminHash,
      teamId: "hq",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: "Administrador",
      email: adminEmail,
      password: adminHash,
      teamId: "hq",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const demoUsers = [
    { name: "Manager Alpha", email: "manager.alpha@clockhub.local", role: Role.MANAGER, teamId: "alpha" },
    { name: "Ana Employee", email: "ana.employee@clockhub.local", role: Role.EMPLOYEE, teamId: "alpha" },
    { name: "Luis Employee", email: "luis.employee@clockhub.local", role: Role.EMPLOYEE, teamId: "alpha" },
    { name: "Manager Beta", email: "manager.beta@clockhub.local", role: Role.MANAGER, teamId: "beta" },
    { name: "Sara Employee", email: "sara.employee@clockhub.local", role: Role.EMPLOYEE, teamId: "beta" },
  ] as const;

  const createdUsers = [];
  for (const demo of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        name: demo.name,
        password: sampleHash,
        role: demo.role,
        status: UserStatus.ACTIVE,
        teamId: demo.teamId,
      },
      create: {
        name: demo.name,
        email: demo.email,
        password: sampleHash,
        role: demo.role,
        status: UserStatus.ACTIVE,
        teamId: demo.teamId,
      },
    });
    createdUsers.push(user);
  }

  const schedulesCount = await prisma.schedule.count();
  if (schedulesCount === 0) {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);

    const twoHoursLater = new Date(nextHour);
    twoHoursLater.setHours(twoHoursLater.getHours() + 2);

    const tomorrow = new Date(nextHour);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(tomorrowEnd.getHours() + 3);

    await prisma.schedule.createMany({
      data: [
        {
          title: "Turno Soporte Alpha",
          description: "Soporte de incidencias internas",
          userId: createdUsers[1].id,
          createdById: admin.id,
          startAt: nextHour,
          endAt: twoHoursLater,
          status: ScheduleStatus.ACTIVE,
        },
        {
          title: "Reunión Operativa Alpha",
          description: "Seguimiento semanal",
          userId: createdUsers[0].id,
          createdById: admin.id,
          startAt: tomorrow,
          endAt: tomorrowEnd,
          status: ScheduleStatus.ACTIVE,
        },
        {
          title: "Turno Beta Cancelado",
          description: "Ejemplo de soft delete",
          userId: createdUsers[4].id,
          createdById: admin.id,
          startAt: tomorrow,
          endAt: tomorrowEnd,
          status: ScheduleStatus.CANCELLED,
        },
      ],
    });
  }

  const auditCount = await prisma.auditLog.count();
  if (auditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          action: AuditAction.LOGIN,
          entity: "AUTH",
          entityId: String(admin.id),
          message: "Seed inicial de login admin",
          userId: admin.id,
        },
        {
          action: AuditAction.CREATE,
          entity: "USER",
          entityId: String(createdUsers[1].id),
          message: "Seed de usuario demo",
          userId: admin.id,
        },
      ],
    });
  }

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
