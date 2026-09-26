import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const locationId = searchParams.get("locationId") || undefined;

    const moves = db.getMoves(productId, locationId);
    return NextResponse.json(moves);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch moves" }, { status: 500 });
  }
}
