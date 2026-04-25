import { NextRequest } from "next/server";
import { createUserAction, getUsersAction } from "@/actions/users";
import { fail, fromActionResult } from "@/lib/api-response";

export async function GET() {
  const result = await getUsersAction();
  return fromActionResult(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createUserAction(body);
    return fromActionResult(result);
  } catch {
    return fail("JSON inválido", 400, "VALIDATION_ERROR");
  }
}
