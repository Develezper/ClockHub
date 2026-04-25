import { NextRequest } from "next/server";
import { createScheduleAction, getSchedulesAction } from "@/actions/schedules";
import { fail, fromActionResult } from "@/lib/api-response";

export async function GET() {
  try {
    const result = await getSchedulesAction();
    return fromActionResult(result);
  } catch {
    return fail("No se pudo procesar la solicitud", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return fail("JSON inválido", 400, "VALIDATION_ERROR");
  }

  try {
    const result = await createScheduleAction(body);
    return fromActionResult(result);
  } catch {
    return fail("No se pudo procesar la solicitud", 500, "INTERNAL_ERROR");
  }
}
