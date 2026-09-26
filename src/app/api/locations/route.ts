import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const locations = db.getLocations(warehouseId);
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch locations" }, { status: 500 });
  }
}
