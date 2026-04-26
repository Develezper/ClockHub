import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, issueTokenPair } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";
import { env, isProduction } from "@/lib/env";
import { isPathAllowedByRole } from "@/constants/role-routes";
import type { UserRole } from "@/types";

function unauthorizedApiResponse() {
  return NextResponse.json(
    { success: false, message: "No autenticado", code: "UNAUTHORIZED" },
    { status: 401 },
  );
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return pathname.startsWith("/api/") ? unauthorizedApiResponse() : redirectToLogin(request);
  }

  try {
    const payload = await verifyToken(token, "access");
    return handleAllowedRequest(request, payload.sub, payload.role as UserRole);
  } catch (error: any) {
    // If expired, try to refresh
    if (error.code === "ERR_JWT_EXPIRED" || error.message?.includes("expired")) {
      const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
      
      if (refreshToken) {
        try {
          const refreshPayload = await verifyToken(refreshToken, "refresh");
          const userId = Number(refreshPayload.sub);
          
          const user = await db.user.findUnique({ 
            where: { id: userId },
            select: { id: true, email: true, role: true, status: true }
          });
          
          if (user && user.status === "ACTIVE") {
            const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user);
            
            // Continue request with new token info
            const response = await handleAllowedRequest(request, String(user.id), user.role as UserRole);
            
            // Set new cookies
            response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: "lax",
              path: "/",
              maxAge: env.ACCESS_TOKEN_TTL_SECONDS
            });
            
            response.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: "lax",
              path: "/",
              maxAge: env.REFRESH_TOKEN_TTL_SECONDS
            });
            
            return response;
          }
        } catch {
          // Refresh failed
        }
      }
    }
    
    return pathname.startsWith("/api/") ? unauthorizedApiResponse() : redirectToLogin(request);
  }
}

async function handleAllowedRequest(request: NextRequest, userId: string, role: UserRole) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith("/dashboard") && !isPathAllowedByRole(pathname, role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId);
  requestHeaders.set("x-user-role", role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
