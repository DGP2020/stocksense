"use client";

import React, { useState } from "react";
import {
  User,
  ShieldCheck,
  Briefcase,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Role } from "@/types";

interface ProfileViewProps {
  currentRole: Role;
  onToggleRole: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentRole, onToggleRole }) => {
  const [email, setEmail] = useState(
    currentRole === "MANAGER" ? "manager@stocksense.io" : "staff@stocksense.io"
  );
  const [otpStep, setOtpStep] = useState<"IDLE" | "REQUESTED" | "RESET_DONE">("IDLE");
  const [otpCode, setOtpCode] = useState("");
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REQUEST_OTP", email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSimulatedCode(data.code);
      setOtpCode(data.code); // auto-fill for frictionless hackathon demonstration!
      setOtpStep("REQUESTED");
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_OTP", email, code: otpCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOtpStep("RESET_DONE");
    } catch (err: any) {
      setOtpError(err.message || "Invalid OTP code");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          <span>User Profile & Security Authentication</span>
        </h2>
        <p className="text-xs text-slate-400">
          Role-based access control, active session credentials, and OTP password recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-950/40">
              {currentRole === "MANAGER" ? "SJ" : "MV"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentRole === "MANAGER" ? "Sarah Jenkins" : "Marcus Vance"}
              </h3>
              <p className="text-xs text-slate-400">
                {currentRole === "MANAGER" ? "manager@stocksense.io" : "staff@stocksense.io"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    currentRole === "MANAGER"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-teal-500/20 text-teal-300 border-teal-500/30"
                  }`}
                >
                  {currentRole === "MANAGER" ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5" />
                  )}
                  <span>Role: {currentRole}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Simulate Role Switching</p>
                <p className="text-[11px] text-slate-400">
                  Switch between Manager and Staff to test access & workflows.
                </p>
              </div>
              <button
                onClick={onToggleRole}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-all hover:scale-105 active:scale-95"
              >
                Switch to {currentRole === "MANAGER" ? "Staff" : "Manager"}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700/60 text-[11px] space-y-1">
              <span className="font-semibold text-slate-300">Role Capabilities:</span>
              {currentRole === "MANAGER" ? (
                <ul className="list-disc pl-4 text-slate-400 space-y-0.5">
                  <li>Full authority to configure warehouses and locations</li>
                  <li>Set and modify SKU reordering thresholds</li>
                  <li>Authorize and validate incoming receipts and customer dispatches</li>
                  <li>Review comprehensive ledger audit history</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 text-slate-400 space-y-0.5">
                  <li>Execute internal transfers across warehouse zones</li>
                  <li>Pick and pack goods for delivery dispatches</li>
                  <li>Perform physical inventory stock counts & cycle counts</li>
                  <li>Log damages and material scrap adjustments</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* OTP-Based Password Reset Console */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">OTP-Based Password Reset</h3>
          </div>
          <p className="text-xs text-slate-400">
            Secure two-factor OTP authentication mechanism required by the Odoo Hackathon specification.
          </p>

          {otpStep === "IDLE" && (
            <form onSubmit={handleRequestOTP} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Account Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {otpError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{otpError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-900/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Request 6-Digit Verification OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {otpStep === "REQUESTED" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
              {simulatedCode && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>OTP Simulated Dispatch:</span>
                    </span>
                    <span className="font-mono text-base font-bold tracking-widest bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/40 text-white">
                      {simulatedCode}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    Valid for 10 minutes. Pre-filled below for instant testing!
                  </p>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">Enter 6-Digit OTP Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono text-center text-lg font-bold text-white tracking-widest focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">New Secure Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {otpError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{otpError}</span>
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOtpStep("IDLE")}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & Set Password</span>
                </button>
              </div>
            </form>
          )}

          {otpStep === "RESET_DONE" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Password Reset Verified!</h4>
              <p className="text-xs text-slate-300">
                Your new credentials have been secured and recorded in the authentication store.
              </p>
              <button
                onClick={() => setOtpStep("IDLE")}
                className="mt-2 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Reset Another Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
