import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

export type SessionActor = {
  id: number;
  role: UserRole;
  email?: string;
  teamId?: string;
};

export async function getSessionActor(): Promise<SessionActor | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token, "access");
    const id = Number(payload.sub);

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        teamId: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    return {
      id: user.id,
      role: user.role,
      email: user.email,
      teamId: user.teamId ?? undefined,
    };
  } catch {
    return null;
  }
}
