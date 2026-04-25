import { NextResponse } from "next/server";

export type ApiResponseBody<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
};

export function ok<T>(message: string, data?: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponseBody<T>>(
    {
      success: true,
      message,
      data,
    },
    init,
  );
}

export function fail(message: string, status = 400, code?: string) {
  return NextResponse.json<ApiResponseBody>(
    {
      success: false,
      message,
      code,
    },
    { status },
  );
}

export function statusFromCode(code?: string): number {
  switch (code) {
    case "UNAUTHORIZED":
    case "INVALID_TOKEN":
    case "INVALID_SESSION":
    case "MISSING_REFRESH_TOKEN":
    case "INVALID_REFRESH_TOKEN":
      return 401;
    case "FORBIDDEN":
    case "SELF_DELETE_FORBIDDEN":
      return 403;
    case "USER_NOT_FOUND":
    case "SCHEDULE_NOT_FOUND":
      return 404;
    case "EMAIL_TAKEN":
    case "SCHEDULE_CONFLICT":
      return 409;
    case "VALIDATION_ERROR":
    case "INVALID_USER":
    case "INVALID_SCHEDULE":
      return 400;
    default:
      return 400;
  }
}

export function fromActionResult<T>(result: ApiResponseBody<T>) {
  if (result.success) {
    return ok(result.message, result.data);
  }
  return fail(result.message, statusFromCode(result.code), result.code);
}
