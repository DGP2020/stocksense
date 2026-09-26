import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { validateWarehouseInput } from "@/lib/validation";

export async function GET() {
  try {
    const warehouses = db.getWarehouses();
    return NextResponse.json(warehouses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch warehouses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateWarehouseInput(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error || "Invalid warehouse input" }, { status: 400 });
    }

    const wh = db.createWarehouse(validation.data);
    return NextResponse.json(wh, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create warehouse" }, { status: 400 });
  }
}
