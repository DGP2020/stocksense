"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Minus,
  CheckCircle2,
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
  onResetData: _onResetData,
  onOpenDemo,
  lowStockCount,
}) => {
  const [opsOpen, setOpsOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  const isOpsActive = ["receipts", "deliveries", "transfers", "adjustments"].includes(currentTab);

  return (
    <aside className="w-64 bg-[#18201D] text-slate-300 flex flex-col h-full rounded-l-3xl border-r border-[#242E2A] select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#242E2A]/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0FA974] flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">StockSense</span>
        </div>

        <button
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg"
          title="Sidebar Collapse"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 text-xs font-medium">
        {/* Main Section */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main
          </p>

          <div className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => onSelectTab("dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                currentTab === "dashboard"
                  ? "bg-[#25322B] text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#202925]"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 ${currentTab === "dashboard" ? "text-[#0FA974]" : "text-slate-500"}`} />
                <span>Dashboard</span>
              </div>
            </button>

            {/* Inventory / Products Dropdown */}
            <div>
              <button
                onClick={() => setInventoryOpen(!inventoryOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  currentTab === "products"
                    ? "bg-[#25322B] text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-[#202925]"
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTab("products");
                  }}
                >
                  <Package className={`w-4 h-4 ${currentTab === "products" ? "text-[#0FA974]" : "text-slate-500"}`} />
                  <span>Inventory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {lowStockCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {inventoryOpen ? (
                    <Minus className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </button>

              {inventoryOpen && (
                <div className="ml-5 pl-3 border-l border-[#27352E] mt-1 space-y-1">
                  <button
                    onClick={() => onSelectTab("products")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                      currentTab === "products"
                        ? "text-[#0FA974] font-semibold bg-[#202D26]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>Products & Stock</span>
                    {lowStockCount > 0 && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full">
                        {lowStockCount} alert
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Operations Dropdown (Receipts, Deliveries, Transfers, Adjustments) */}
            <div>
              <button
                onClick={() => setOpsOpen(!opsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  isOpsActive
                    ? "bg-[#25322B] text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-[#202925]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className={`w-4 h-4 ${isOpsActive ? "text-[#0FA974]" : "text-slate-500"}`} />
                  <span>Operations</span>
                </div>
                {opsOpen ? (
                  <Minus className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {opsOpen && (
                <div className="ml-5 pl-3 border-l border-[#27352E] mt-1 space-y-1">
                  <button
                    onClick={() => onSelectTab("receipts")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                      currentTab === "receipts"
                        ? "text-[#0FA974] font-semibold bg-[#202D26]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Receipts (Incoming)
                  </button>
                  <button
                    onClick={() => onSelectTab("deliveries")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                      currentTab === "deliveries"
                        ? "text-[#0FA974] font-semibold bg-[#202D26]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Delivery Orders
                  </button>
                  <button
                    onClick={() => onSelectTab("transfers")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                      currentTab === "transfers"
                        ? "text-[#0FA974] font-semibold bg-[#202D26]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Internal Transfers
                  </button>
                  <button
                    onClick={() => onSelectTab("adjustments")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors ${
                      currentTab === "adjustments"
                        ? "text-[#0FA974] font-semibold bg-[#202D26]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Stock Adjustments
                  </button>
                </div>
              )}
            </div>

            {/* Move History */}
            <button
              onClick={() => onSelectTab("moves")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                currentTab === "moves"
                  ? "bg-[#25322B] text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#202925]"
              }`}
            >
              <div className="flex items-center gap-3">
                <History className={`w-4 h-4 ${currentTab === "moves" ? "text-[#0FA974]" : "text-slate-500"}`} />
                <span>Move History</span>
              </div>
            </button>
          </div>
        </div>

        {/* Management Section */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Management
          </p>

          <div className="space-y-1">
            <button
              onClick={() => onSelectTab("warehouses")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                currentTab === "warehouses"
                  ? "bg-[#25322B] text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#202925]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 ${currentTab === "warehouses" ? "text-[#0FA974]" : "text-slate-500"}`} />
                <span>Warehouses</span>
              </div>
            </button>

            <button
              onClick={() => onSelectTab("profile")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                currentTab === "profile"
                  ? "bg-[#25322B] text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-[#202925]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${currentTab === "profile" ? "text-[#0FA974]" : "text-slate-500"}`} />
                <span>Profile & Security</span>
              </div>
            </button>
          </div>
        </div>

        {/* Others Section */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Others
          </p>

          <div className="space-y-1">
            <button
              onClick={onOpenDemo}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-[#202925] transition-all group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Hackathon 4-Step Demo</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                Run
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* User Footer Card matching Interoly */}
      <div className="p-3 border-t border-[#242E2A]">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-[#202B26] border border-[#2B3932]/70">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar circle with online status dot */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10">
                {currentRole === "MANAGER" ? "SJ" : "MV"}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#18201D] rounded-full" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentRole === "MANAGER" ? "Sarah Jenkins" : "Marcus Vance"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentRole === "MANAGER" ? "sarah.j@stocksense.io" : "marcus.v@stocksense.io"}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleRole}
            title={`Switch to ${currentRole === "MANAGER" ? "Staff" : "Manager"}`}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#2B3932] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
