import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { OperationType, OperationStatus } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentType = (searchParams.get("type") as OperationType) || undefined;
    const status = (searchParams.get("status") as OperationStatus) || undefined;
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const searchQuery = searchParams.get("search") || undefined;

    const operations = db.getOperations({
      documentType,
      status,
      warehouseId,
      searchQuery,
    });
    return NextResponse.json(operations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch operations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const operation = db.createOperation(body);
    return NextResponse.json(operation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create operation" }, { status: 400 });
  }
}
