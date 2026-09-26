import { NextRequest, NextResponse } from "next/server";
import { getSecurityAuditLogs } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
    const logs = getSecurityAuditLogs(limit);

    return NextResponse.json({
      standard: "ISO/IEC 27001:2022 Control A.8.15 & NIST SP 800-53 Rev. 5 AU-2/AU-3",
      totalEvents: logs.length,
      events: logs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
