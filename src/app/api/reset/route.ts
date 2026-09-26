import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { getClientIP, logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const data = db.resetData();

    logSecurityEvent({
      eventType: "DATABASE_RESET",
      severity: "WARNING",
      actor: "System Administrator",
      ipAddress: ip,
      details: { action: "DEMO_ENVIRONMENT_RESET" },
      status: "SUCCESS",
    });

    return NextResponse.json({ message: "Demo data reset successfully", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reset data" }, { status: 500 });
  }
}
