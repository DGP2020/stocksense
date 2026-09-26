import { NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function POST() {
  try {
    const data = db.resetData();
    return NextResponse.json({ message: "Demo data reset successfully", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reset data" }, { status: 500 });
  }
}
