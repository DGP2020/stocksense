import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = db.createInventoryAdjustment({
      productId: body.productId,
      locationId: body.locationId,
      countedQuantity: Number(body.countedQuantity),
      reason: body.reason,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create adjustment" }, { status: 400 });
  }
}
