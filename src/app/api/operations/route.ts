import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { OperationType, OperationStatus } from "@/types";
import { validateOperationInput, sanitizeString } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawType = searchParams.get("type");
    const rawStatus = searchParams.get("status");
    const warehouseId = sanitizeString(searchParams.get("warehouseId") || "", 80) || undefined;
    const searchQuery = sanitizeString(searchParams.get("search") || "", 100) || undefined;

    const validTypes: OperationType[] = ["RECEIPT", "DELIVERY", "INTERNAL_TRANSFER", "ADJUSTMENT"];
    const validStatuses: OperationStatus[] = ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"];

    const documentType = validTypes.includes(rawType as OperationType) ? (rawType as OperationType) : undefined;
    const status = validStatuses.includes(rawStatus as OperationStatus) ? (rawStatus as OperationStatus) : undefined;

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
    const validation = validateOperationInput(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error || "Invalid operation input" }, { status: 400 });
    }

    const operation = db.createOperation(validation.data);
    return NextResponse.json(operation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create operation" }, { status: 400 });
  }
}
