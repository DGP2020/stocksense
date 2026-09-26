"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Calendar,
  Building,
  AlertTriangle,
  X,
  ArrowRight,
} from "lucide-react";
import { Warehouse, DashboardKPIs, Role } from "@/types";

interface HeaderProps {
  currentRole?: Role;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onSelectWarehouse: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  kpis: DashboardKPIs | null;
  onNavigateToProducts: () => void;
  title?: string;
  subtitle?: string;
  onOpenDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole = "MANAGER",
  warehouses,
  selectedWarehouseId,
  onSelectWarehouse,
  searchQuery,
  onSearchChange,
  kpis,
  onNavigateToProducts,
}) => {
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const totalAlerts = (kpis?.lowStockCount || 0) + (kpis?.outOfStockCount || 0);

  const userName = currentRole === "MANAGER" ? "Sarah Jenkins" : "Marcus Vance";

  return (
    <header className="h-[60px] px-[24px] flex items-center justify-between border-b border-gray-100 bg-white select-none">
      {/* Greeting Left */}
      <div className="flex items-center gap-[6px]">
        <span className="text-[15px]" role="img" aria-label="sun">
          ☀️
        </span>
        <h2 className="text-[13px] font-bold text-gray-900 tracking-[-0.01em]">
          Hello, {userName}!
        </h2>
      </div>

      {/* Actions and Controls Right */}
      <div className="flex items-center gap-[12px]">
        {/* Search Input matching template */}
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-[36px] pr-[48px] py-[6px] bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] transition-all"
          />
          <div className="absolute right-[12px] top-1/2 -translate-y-1/2 flex items-center gap-[3px] px-[6px] py-[3px] rounded bg-gray-200/60 text-[10px] font-semibold text-gray-500 font-mono">
            <span>⌘</span>
            <span>F</span>
          </div>
        </div>

        {/* Warehouse Selector */}
        <div className="relative hidden sm:block">
          <div className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-xl border border-gray-200/80 bg-white hover:bg-gray-50 text-xs text-gray-700 transition-colors">
            <Building className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => onSelectWarehouse(e.target.value)}
              className="bg-transparent text-xs text-gray-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} — {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar button matching template */}
        <button
          className="p-[8px] rounded-xl border border-gray-200/80 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          title="Date Filter"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Notification Bell with badge matching template */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="p-[8px] rounded-xl border border-gray-200/80 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-[6px] w-[300px] rounded-2xl bg-white border border-gray-200 shadow-xl p-[18px] z-50">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-gray-900">Stock Alerts</span>
                </div>
                <button
                  onClick={() => setShowAlertsMenu(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {kpis?.lowStockItems && kpis.lowStockItems.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {kpis.lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.totalStock <= 0
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.totalStock} {item.uom}
                        </span>
                        <p className="text-[9px] text-gray-400 mt-0.5">Min: {item.minStock}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setShowAlertsMenu(false);
                      onNavigateToProducts();
                    }}
                    className="w-full mt-2 text-center text-xs text-[#0FA974] hover:text-emerald-700 font-medium py-1 flex items-center justify-center gap-1"
                  >
                    <span>View all products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">All stock levels healthy!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
