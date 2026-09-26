import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/storage";
import { isValidEmail, isValidOTPCode, sanitizeString } from "@/lib/validation";
import { checkRateLimit, clearRateLimit, getClientIP, logSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  try {
    const body = await req.json();
    const action = sanitizeString(body?.action, 30);
    const rawEmail = body?.email;
    const rawCode = body?.code;
    const newPassword = body?.newPassword ? sanitizeString(body.newPassword, 128) : undefined;

    // Validate email format
    if (!rawEmail || !isValidEmail(rawEmail)) {
      logSecurityEvent({
        eventType: "AUTH_OTP_FAILED",
        severity: "WARNING",
        actor: String(rawEmail || "UNKNOWN"),
        ipAddress: ip,
        details: { reason: "Invalid or malformed email address provided" },
        status: "FAILURE",
      });
      return NextResponse.json(
        { error: "A valid email address is required (e.g. user@example.com)" },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Request OTP Flow
    if (action === "REQUEST_OTP") {
      // Rate limiting: Max 5 OTP requests per 10 minutes per email & IP (NIST IA-5 & OWASP A07)
      const emailLimit = checkRateLimit(`otp-req:${email}`, 5, 10 * 60 * 1000);
      const ipLimit = checkRateLimit(`otp-req-ip:${ip}`, 15, 10 * 60 * 1000);

      if (!emailLimit.allowed || !ipLimit.allowed) {
        const retryAfter = emailLimit.retryAfterSec || ipLimit.retryAfterSec || 60;
        logSecurityEvent({
          eventType: "AUTH_RATE_LIMITED",
          severity: "WARNING",
          actor: email,
          ipAddress: ip,
          details: { action: "REQUEST_OTP", retryAfterSec: retryAfter },
          status: "BLOCKED",
        });
        return NextResponse.json(
          { error: `Too many OTP requests. Please wait ${retryAfter} seconds before requesting a new code.` },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
      }

      const otp = db.generateOTP(email);

      logSecurityEvent({
        eventType: "AUTH_OTP_REQUESTED",
        severity: "INFO",
        actor: email,
        ipAddress: ip,
        details: { expiresInMinutes: 10 },
        status: "SUCCESS",
      });

      return NextResponse.json({
        message: "OTP sent successfully (simulated)",
        code: otp, // Returned for evaluation/demo in the hackathon!
        expiresInMinutes: 10,
      });
    }

    // 2. Verify OTP Flow
    if (action === "VERIFY_OTP") {
      // Validate OTP code format strictly (6 digits)
      if (!rawCode || !isValidOTPCode(rawCode)) {
        logSecurityEvent({
          eventType: "AUTH_OTP_FAILED",
          severity: "WARNING",
          actor: email,
          ipAddress: ip,
          details: { reason: "Malformed or non-numeric OTP code supplied" },
          status: "FAILURE",
        });
        return NextResponse.json(
          { error: "Invalid OTP format. Must be a 6-digit numeric verification code." },
          { status: 400 }
        );
      }

      // Brute-force protection: Max 5 verification attempts per 10 minutes (NIST IA-5)
      const verifyLimit = checkRateLimit(`otp-verify:${email}`, 5, 10 * 60 * 1000);
      if (!verifyLimit.allowed) {
        logSecurityEvent({
          eventType: "AUTH_RATE_LIMITED",
          severity: "CRITICAL",
          actor: email,
          ipAddress: ip,
          details: { action: "VERIFY_OTP", reason: "Excessive failed OTP verification attempts" },
          status: "BLOCKED",
        });
        return NextResponse.json(
          { error: "Account verification locked due to excessive failed attempts. Please request a new OTP code." },
          { status: 429 }
        );
      }

      const codeStr = String(rawCode).trim();
      const isValid = db.verifyOTPAndResetPassword(email, codeStr, newPassword);

      if (!isValid) {
        logSecurityEvent({
          eventType: "AUTH_OTP_FAILED",
          severity: "WARNING",
          actor: email,
          ipAddress: ip,
          details: { remainingAttempts: verifyLimit.remaining },
          status: "FAILURE",
        });
        return NextResponse.json(
          { error: `Invalid or expired OTP code. (${verifyLimit.remaining} attempts remaining)` },
          { status: 400 }
        );
      }

      // Successful verification: clear lockout limits
      clearRateLimit(`otp-verify:${email}`);
      clearRateLimit(`otp-req:${email}`);

      logSecurityEvent({
        eventType: "AUTH_OTP_VERIFIED",
        severity: "INFO",
        actor: email,
        ipAddress: ip,
        details: { action: "PASSWORD_RESET_COMPLETED" },
        status: "SUCCESS",
      });

      return NextResponse.json({
        success: true,
        message: "Password reset verified and completed successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Authentication error" }, { status: 500 });
  }
}
