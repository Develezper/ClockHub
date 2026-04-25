import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import type { UserRole } from "@/types";

export type SessionActor = {
  id: number;
  role: UserRole;
  email?: string;
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

    return {
      id,
      role: payload.role,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
