import { NextRequest } from "next/server";
import { deleteUserAction, updateUserAction } from "@/actions/users";
import { fail, fromActionResult } from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const result = await updateUserAction({ ...body, id });
    return fromActionResult(result);
  } catch {
    return fail("JSON inválido", 400, "VALIDATION_ERROR");
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const result = await deleteUserAction(id);
  return fromActionResult(result);
}
