import type { Role, User } from "@prisma/client";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export type SafeAuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

export function toSafeAuthUser(user: User): SafeAuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function issueTokenPair(user: Pick<User, "id" | "email" | "role">) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
  };

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  return { accessToken, refreshToken };
}
