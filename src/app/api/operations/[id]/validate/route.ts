import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { sanitizeString } from "@/lib/validation";
import { getClientIP, logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIP(req);

  try {
    const { id } = await params;
    const cleanId = sanitizeString(id, 80);

    if (!cleanId) {
      return NextResponse.json({ error: "Operation ID is required" }, { status: 400 });
    }

    const result = db.validateOperation(cleanId);

    logSecurityEvent({
      eventType: "OPERATION_VALIDATED",
      severity: "INFO",
      actor: "Operations Lead",
      ipAddress: ip,
      details: {
        operationId: cleanId,
        reference: result.operation.reference,
        type: result.operation.type,
        movesApplied: result.movesApplied,
      },
      status: "SUCCESS",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate operation" }, { status: 400 });
  }
}
