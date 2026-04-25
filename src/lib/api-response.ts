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

const STATUS_MAP: Record<string, number> = {
  UNAUTHORIZED: 401, INVALID_TOKEN: 401, INVALID_SESSION: 401,
  MISSING_REFRESH_TOKEN: 401, INVALID_REFRESH_TOKEN: 401,
  FORBIDDEN: 403, SELF_DELETE_FORBIDDEN: 403,
  USER_NOT_FOUND: 404, SCHEDULE_NOT_FOUND: 404,
  EMAIL_TAKEN: 409, SCHEDULE_CONFLICT: 409,
  VALIDATION_ERROR: 400, INVALID_USER: 400, INVALID_SCHEDULE: 400,
};

export function statusFromCode(code?: string): number {
  return (code && STATUS_MAP[code]) || 500;
}

export function fromActionResult<T>(result: ApiResponseBody<T>) {
  if (result.success) {
    return ok(result.message, result.data);
  }
  return fail(result.message, statusFromCode(result.code), result.code);
}
