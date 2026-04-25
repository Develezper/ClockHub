import { getAuditLogsAction } from "@/actions/audit";
import { fromActionResult } from "@/lib/api-response";

export async function GET() {
  const result = await getAuditLogsAction();
  return fromActionResult(result);
}
