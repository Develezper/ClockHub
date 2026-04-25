import { NextRequest } from "next/server";
import { deleteUserAction, updateUserAction } from "@/actions/users";
import { fail, fromActionResult } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return fail("JSON inválido", 400, "VALIDATION_ERROR");
  }

  try {
    const { id } = await context.params;
    const result = await updateUserAction({ ...(body as Record<string, unknown>), id });
    return fromActionResult(result);
  } catch {
    return fail("No se pudo procesar la solicitud", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteUserAction(id);
    return fromActionResult(result);
  } catch {
    return fail("No se pudo procesar la solicitud", 500, "INTERNAL_ERROR");
  }
}
