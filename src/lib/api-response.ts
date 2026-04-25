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
