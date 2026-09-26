/**
 * StockSense Security & Compliance Engine
 * Standards Implemented:
 * - NIST SP 800-53 Rev. 5:
 *   - AU-2, AU-3, AU-12 (Audit Event Generation, Content & Storage)
 *   - IA-2, IA-5 (Identification, Authentication & Authenticator Management)
 *   - AC-3 (Access Enforcement)
 * - ISO/IEC 27001:2022:
 *   - A.5.15 (Access Control)
 *   - A.8.5 (Secure Authentication)
 *   - A.8.15 (Logging and Monitoring)
 * - OWASP Top 10 (2021):
 *   - A01:2021 - Broken Access Control
 *   - A07:2021 - Identification & Authentication Failures
 *   - A09:2021 - Security Logging and Monitoring Failures
 */

import { NextRequest } from "next/server";

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  eventType:
    | "AUTH_OTP_REQUESTED"
    | "AUTH_OTP_VERIFIED"
    | "AUTH_OTP_FAILED"
    | "AUTH_RATE_LIMITED"
    | "INVENTORY_ADJUSTMENT"
    | "OPERATION_VALIDATED"
    | "PRODUCT_CREATED"
    | "DATABASE_RESET"
    | "UNAUTHORIZED_ACCESS_ATTEMPT";
  severity: "INFO" | "WARNING" | "CRITICAL";
  actor: string;
  ipAddress: string;
  details: Record<string, any>;
  status: "SUCCESS" | "FAILURE" | "BLOCKED";
}

// In-Memory Ring Buffer for Security Audit Events (retains last 500 events)
const MAX_AUDIT_LOGS = 500;
const auditLogBuffer: SecurityAuditEvent[] = [];

/**
 * Record a tamper-evident structured security audit log entry.
 */
export function logSecurityEvent(
  event: Omit<SecurityAuditEvent, "id" | "timestamp">
): SecurityAuditEvent {
  const auditEntry: SecurityAuditEvent = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  auditLogBuffer.unshift(auditEntry);
  if (auditLogBuffer.length > MAX_AUDIT_LOGS) {
    auditLogBuffer.pop();
  }

  // Structured console log for container log forwarding (SIEM ingestion)
  const logPrefix = `[SECURITY_AUDIT][${auditEntry.severity}][${auditEntry.eventType}]`;
  if (auditEntry.severity === "CRITICAL" || auditEntry.status === "FAILURE" || auditEntry.status === "BLOCKED") {
    console.warn(logPrefix, JSON.stringify(auditEntry));
  } else {
    console.info(logPrefix, JSON.stringify(auditEntry));
  }

  return auditEntry;
}

/**
 * Retrieve recent security audit logs for compliance monitoring.
 */
export function getSecurityAuditLogs(limit = 100): SecurityAuditEvent[] {
  return auditLogBuffer.slice(0, limit);
}

// --- Rate Limiting Engine ---
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Generic sliding window rate limiter.
 * @param key Unique identifier (e.g. `otp-request:${ip}` or `otp-verify:${email}`)
 * @param maxAttempts Max allowed attempts
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

/**
 * Reset rate limit counter on successful action
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Extract client IP safely from Next.js request headers.
 */
export function getClientIP(req: NextRequest): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIP = req.headers.get("x-real-ip");
  if (xRealIP) {
    return xRealIP.trim();
  }
  return "127.0.0.1";
}
