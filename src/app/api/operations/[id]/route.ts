import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const op = db.getOperationById(id);
    if (!op) return NextResponse.json({ error: "Operation not found" }, { status: 404 });
    return NextResponse.json(op);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch operation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const updated = db.updateOperationStatus(id, status);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update operation status" }, { status: 400 });
  }
}
