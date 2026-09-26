import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { action, email, code, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (action === "REQUEST_OTP") {
      const otp = db.generateOTP(email);
      return NextResponse.json({
        message: "OTP sent successfully (simulated)",
        code: otp, // Returned for effortless evaluation/demo in the hackathon!
        expiresInMinutes: 10,
      });
    }

    if (action === "VERIFY_OTP") {
      if (!code) {
        return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
      }
      const isValid = db.verifyOTPAndResetPassword(email, code, newPassword);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "Password reset verified and completed successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Authentication error" }, { status: 500 });
  }
}
