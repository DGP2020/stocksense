import { NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function GET() {
  try {
    const kpis = db.getKPIs();
    return NextResponse.json(kpis);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch KPIs" }, { status: 500 });
  }
}
