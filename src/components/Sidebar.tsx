"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  User,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { Role } from "@/types";

export type NavTab =
  | "dashboard"
  | "products"
  | "receipts"
  | "deliveries"
  | "transfers"
  | "adjustments"
  | "moves"
  | "warehouses"
  | "profile";

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentRole: Role;
  onToggleRole: () => void;
  onResetData: () => void;
  onOpenDemo: () => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onToggleRole,
  onResetData,
  onOpenDemo,
  lowStockCount,
}) => {
  const mainNav = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard },
    {
      id: "products" as NavTab,
      label: "Products & Stock",
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
  ];

  const operationsNav = [
    { id: "receipts" as NavTab, label: "Receipts (Incoming)", icon: ArrowDownLeft },
    { id: "deliveries" as NavTab, label: "Delivery Orders", icon: ArrowUpRight },
    { id: "transfers" as NavTab, label: "Internal Transfers", icon: ArrowLeftRight },
    { id: "adjustments" as NavTab, label: "Stock Adjustments", icon: SlidersHorizontal },
    { id: "moves" as NavTab, label: "Move History", icon: History },
  ];

  const settingsNav = [
    { id: "warehouses" as NavTab, label: "Warehouses & Config", icon: Building2 },
    { id: "profile" as NavTab, label: "My Profile & OTP", icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-teal-500 flex items-center justify-center shadow-lg shadow-purple-900/30 ring-1 ring-white/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">StockSense</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Odoo IMS
              </span>
            </div>
            <p className="text-xs text-slate-400">Ledger-Backed Stock System</p>
          </div>
        </div>

        {/* 1-Click Hackathon Flow Interactive Stepper Button */}
        <button
          onClick={onOpenDemo}
          className="mt-3.5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white text-xs font-medium shadow-md shadow-purple-950/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>Interactive 4-Step Demo</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Views */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Overview</p>
          <nav className="mt-2 space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Operations */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Operations</p>
          <nav className="mt-2 space-y-1">
            {operationsNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings & Admin */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Configuration</p>
          <nav className="mt-2 space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Role Switcher & Bottom Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {currentRole === "MANAGER" ? "M" : "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {currentRole === "MANAGER" ? "Sarah (Manager)" : "Marcus (Staff)"}
              </p>
              <div className="flex items-center gap-1">
                {currentRole === "MANAGER" ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Briefcase className="w-3 h-3 text-cyan-400" />
                )}
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{currentRole}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onToggleRole}
            title="Toggle between Manager and Staff roles for testing"
            className="px-2 py-1 text-[11px] font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            Switch
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={onResetData}
            title="Reset data to default hackathon state"
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
