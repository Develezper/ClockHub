import { getAuditLogsAction } from "@/actions/audit";
import { fail, fromActionResult } from "@/lib/api-response";

export async function GET() {
  try {
    const result = await getAuditLogsAction();
    return fromActionResult(result);
  } catch {
    return fail("No se pudo procesar la solicitud", 500, "INTERNAL_ERROR");
  }
}
