import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { validateProductInput, sanitizeString } from "@/lib/validation";
import { getClientIP, logSecurityEvent } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = sanitizeString(searchParams.get("search") || "", 100) || undefined;
    const category = sanitizeString(searchParams.get("category") || "", 60) || undefined;

    const products = db.getProducts(search, category);
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const body = await req.json();
    const validation = validateProductInput(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error || "Invalid product input" }, { status: 400 });
    }

    const product = db.createProduct(validation.data);

    logSecurityEvent({
      eventType: "PRODUCT_CREATED",
      severity: "INFO",
      actor: "Inventory Admin",
      ipAddress: ip,
      details: { productId: product.id, sku: product.sku, name: product.name },
      status: "SUCCESS",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 400 });
  }
}
