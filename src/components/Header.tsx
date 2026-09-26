"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Building,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  X,
  ArrowRight,
} from "lucide-react";
import { Warehouse, DashboardKPIs } from "@/types";

interface HeaderProps {
  title: string;
  subtitle: string;
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onSelectWarehouse: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  kpis: DashboardKPIs | null;
  onOpenDemo: () => void;
  onNavigateToProducts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  warehouses,
  selectedWarehouseId,
  onSelectWarehouse,
  searchQuery,
  onSearchChange,
  kpis,
  onOpenDemo,
  onNavigateToProducts,
}) => {
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const totalAlerts = (kpis?.lowStockCount || 0) + (kpis?.outOfStockCount || 0);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Context */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      {/* Actions and Selectors */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, product, ref..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Warehouse Selector Filter */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
            <Building className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => onSelectWarehouse(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">
                All Warehouses (Global)
              </option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id} className="bg-slate-900 text-slate-200">
                  {wh.code} — {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerts Center Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className={`p-2 rounded-lg border transition-all relative ${
              totalAlerts > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80"
            }`}
            title="Stock Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Stock Warnings</span>
                </div>
                <button
                  onClick={() => setShowAlertsMenu(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {kpis?.lowStockItems && kpis.lowStockItems.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {kpis.lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.totalStock <= 0
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.totalStock} {item.uom}
                        </span>
                        <p className="text-[9px] text-slate-500 mt-0.5">Min: {item.minStock}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setShowAlertsMenu(false);
                      onNavigateToProducts();
                    }}
                    className="w-full mt-2 text-center text-xs text-purple-400 hover:text-purple-300 font-medium py-1.5 flex items-center justify-center gap-1"
                  >
                    <span>View all in Products catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">All stock levels healthy!</p>
              )}
            </div>
          )}
        </div>

        {/* Quick Demo Walkthrough Launcher */}
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-md shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: "4s" }} />
          <span className="hidden md:inline">Odoo Demo Flow</span>
        </button>
      </div>
    </header>
  );
};
