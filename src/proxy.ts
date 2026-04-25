import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { isPathAllowedByRole } from "@/constants/role-routes";
import type { UserRole } from "@/types";

function unauthorizedApiResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "No autenticado",
      code: "UNAUTHORIZED",
    },
    { status: 401 },
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return unauthorizedApiResponse();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token, "access");
    const role = payload.role as UserRole;

    if (pathname.startsWith("/dashboard") && !isPathAllowedByRole(pathname, role)) {
      const fallbackUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(fallbackUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-role", role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (pathname.startsWith("/api/")) {
      return unauthorizedApiResponse();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
