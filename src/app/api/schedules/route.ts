import { NextRequest } from "next/server";
import { createScheduleAction, getSchedulesAction } from "@/actions/schedules";
import { fail, fromActionResult } from "@/lib/api-response";

export async function GET() {
  const result = await getSchedulesAction();
  return fromActionResult(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createScheduleAction(body);
    return fromActionResult(result);
  } catch {
    return fail("JSON inválido", 400, "VALIDATION_ERROR");
  }
}
