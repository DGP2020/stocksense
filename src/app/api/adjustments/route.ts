import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { validateAdjustmentInput } from "@/lib/validation";
import { getClientIP, logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const body = await req.json();
    const validation = validateAdjustmentInput(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error || "Invalid adjustment input" }, { status: 400 });
    }

    const result = db.createInventoryAdjustment(validation.data);

    logSecurityEvent({
      eventType: "INVENTORY_ADJUSTMENT",
      severity: result.difference !== 0 ? "WARNING" : "INFO",
      actor: "Inventory Auditor",
      ipAddress: ip,
      details: {
        operationId: result.operation.id,
        reference: result.operation.reference,
        productId: validation.data.productId,
        locationId: validation.data.locationId,
        countedQuantity: validation.data.countedQuantity,
        difference: result.difference,
        reason: validation.data.reason,
      },
      status: "SUCCESS",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create adjustment" }, { status: 400 });
  }
}
