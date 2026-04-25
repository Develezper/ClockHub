import { NextRequest } from "next/server";
import { createUserAction, getUsersAction } from "@/actions/users";
import { fail, fromActionResult } from "@/lib/api-response";

export async function GET() {
  try {
    const result = await getUsersAction();
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
    const result = await createUserAction(body);
    return fromActionResult(result);
  } catch {
    return fail("No se pudo procesar la solicitud", 500, "INTERNAL_ERROR");
  }
}
