"use client";

import React from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Check,
  Search,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  DashboardKPIs,
  Operation,
  Warehouse,
  Location,
  OperationType,
  OperationStatus,
} from "@/types";
import { NavTab } from "./Sidebar";

interface DashboardViewProps {
  kpis: DashboardKPIs | null;
  operations: Operation[];
  warehouses: Warehouse[];
  locations: Location[];
  selectedDocType: OperationType | "ALL";
  onSelectDocType: (type: OperationType | "ALL") => void;
  selectedStatus: OperationStatus | "ALL";
  onSelectStatus: (status: OperationStatus | "ALL") => void;
  selectedLocationId: string;
  onSelectLocationId: (id: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onValidateOperation: (id: string) => Promise<void>;
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewOperation: (type: OperationType) => void;
  onOpenDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  operations,
  warehouses: _warehouses,
  locations,
  selectedDocType,
  onSelectDocType,
  selectedStatus,
  onSelectStatus,
  selectedLocationId,
  onSelectLocationId,
  selectedCategory,
  onSelectCategory,
  onValidateOperation,
  onNavigateTab,
  onOpenNewOperation,
  onOpenDemo,
}) => {
  const categories = ["ALL", "Raw Materials", "Finished Goods", "Furniture", "Electronics", "Fasteners"];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#714B67", "#017E84", "#10B981", "#F59E0B"],
      });
    } catch {
      // safe fallback
    }
  };

  const handleValidate = async (id: string) => {
    await onValidateOperation(id);
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Odoo Hackathon Highlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-slate-900/90 to-teal-900/50 border border-purple-500/20 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Odoo Hackathon 8-Hour IMS Sprint</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Real-Time Inventory Operations
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Double-entry ledger-backed movements across warehouses, production racks, and dispatch bays. Complete with atomic validations, stock reconciliation, and audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onOpenNewOperation("RECEIPT")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Receive Goods</span>
            </button>
            <button
              onClick={() => onOpenNewOperation("DELIVERY")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>New Delivery</span>
            </button>
            <button
              onClick={() => onOpenNewOperation("INTERNAL_TRANSFER")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <ArrowLeftRight className="w-4 h-4 text-purple-400" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (5 Specified Dashboard KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Products in Stock */}
        <div
          onClick={() => onNavigateTab("products")}
          className="group cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-200 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">
              {kpis ? kpis.totalProductsCount : "--"}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">SKUs</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Units on hand</span>
            <span className="font-semibold text-purple-300">
              {kpis ? kpis.totalQuantityInStock.toLocaleString() : "--"}
            </span>
          </div>
        </div>

        {/* 2. Low Stock / Out of Stock Items */}
        <div
          onClick={() => onNavigateTab("products")}
          className="group cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-200 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300 tracking-tight">
              {kpis ? kpis.lowStockCount : "--"}
            </span>
            <span className="text-xs text-amber-400/80">Low</span>
            <span className="text-xs text-slate-600">|</span>
            <span className="text-base font-bold text-rose-400">
              {kpis ? kpis.outOfStockCount : "--"}
            </span>
            <span className="text-xs text-rose-400/80">Out</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Automated reorder triggers
          </div>
        </div>

        {/* 3. Pending Receipts */}
        <div
          onClick={() => onNavigateTab("receipts")}
          className="group cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition-all duration-200 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Receipts</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-teal-300 tracking-tight">
              {kpis ? kpis.pendingReceiptsCount : "--"}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">Inbound</span>
          </div>
          <div className="mt-1 text-[11px] text-teal-400/80 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Ready to validate</span>
          </div>
        </div>

        {/* 4. Pending Deliveries */}
        <div
          onClick={() => onNavigateTab("deliveries")}
          className="group cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-200 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Deliveries</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-purple-300 tracking-tight">
              {kpis ? kpis.pendingDeliveriesCount : "--"}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">Outbound</span>
          </div>
          <div className="mt-1 text-[11px] text-purple-400/80 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pick & Pack orders</span>
          </div>
        </div>

        {/* 5. Internal Transfers Scheduled */}
        <div
          onClick={() => onNavigateTab("transfers")}
          className="group cursor-pointer p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Internal Transfers</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-cyan-300 tracking-tight">
              {kpis ? kpis.scheduledTransfersCount : "--"}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">Scheduled</span>
          </div>
          <div className="mt-1 text-[11px] text-cyan-400/80 flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3" />
            <span>Floor relocations</span>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
            <span>Dynamic Operation Filters</span>
          </div>

          <button
            onClick={() => {
              onSelectDocType("ALL");
              onSelectStatus("ALL");
              onSelectLocationId("ALL");
              onSelectCategory("ALL");
            }}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Filter 1: By Document Type */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Document Type
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => onSelectDocType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Document Types</option>
              <option value="RECEIPT">Receipts (Incoming)</option>
              <option value="DELIVERY">Delivery Orders (Outgoing)</option>
              <option value="INTERNAL_TRANSFER">Internal Transfers</option>
              <option value="ADJUSTMENT">Inventory Adjustments</option>
            </select>
          </div>

          {/* Filter 2: By Status */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onSelectStatus(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="WAITING">Waiting</option>
              <option value="READY">Ready</option>
              <option value="DONE">Done</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {/* Filter 3: By Warehouse / Location */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Warehouse / Location
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => onSelectLocationId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">All Internal Locations</option>
              {locations
                .filter((l) => l.type === "INTERNAL")
                .map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter 4: By Product Category */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Product Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Operations Activity Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Operations Ledger Feed</span>
              <span className="text-xs font-normal text-slate-400">
                ({operations.length} {operations.length === 1 ? "operation" : "operations"})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time records of receipts, deliveries, transfers, and inventory adjustments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDemo}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Hackathon Scenario</span>
            </button>
          </div>
        </div>

        {operations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">No operations match your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the filters or create a new operation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Partner / Contact</th>
                  <th className="py-3 px-4">Products & Movements</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {operations.map((op) => {
                  const isDone = op.status === "DONE";
                  const isReady = op.status === "READY";
                  const isWaiting = op.status === "WAITING";

                  // Type pill styling
                  let typeBadge = "bg-slate-800 text-slate-300 border-slate-700";
                  if (op.type === "RECEIPT") typeBadge = "bg-teal-500/15 text-teal-300 border-teal-500/30";
                  if (op.type === "DELIVERY") typeBadge = "bg-purple-500/15 text-purple-300 border-purple-500/30";
                  if (op.type === "INTERNAL_TRANSFER") typeBadge = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
                  if (op.type === "ADJUSTMENT") typeBadge = "bg-amber-500/15 text-amber-300 border-amber-500/30";

                  // Status pill styling
                  let statusBadge = "bg-slate-800 text-slate-400";
                  if (op.status === "READY") statusBadge = "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
                  if (op.status === "WAITING") statusBadge = "bg-amber-500/15 text-amber-300 border border-amber-500/30";
                  if (op.status === "DONE") statusBadge = "bg-slate-700/60 text-slate-300 border border-slate-600";
                  if (op.status === "CANCELED") statusBadge = "bg-rose-500/15 text-rose-300 border border-rose-500/30";

                  return (
                    <tr
                      key={op.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Reference */}
                      <td className="py-3 px-4 font-mono font-semibold text-purple-300 whitespace-nowrap">
                        {op.reference}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${typeBadge}`}>
                          {op.type.replace("_", " ")}
                        </span>
                      </td>

                      {/* Partner */}
                      <td className="py-3 px-4 text-slate-300">
                        {op.partnerName || (
                          <span className="text-slate-500 italic">Internal</span>
                        )}
                      </td>

                      {/* Products & Movements */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {op.moves.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-white">{m.productName}</span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                ({m.quantity > 0 ? `+${m.quantity}` : m.quantity})
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                {m.sourceName} &rarr; {m.destinationName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusBadge}`}>
                          {op.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(op.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isDone && op.status !== "CANCELED" ? (
                          <button
                            onClick={() => handleValidate(op.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ml-auto"
                            title="Validate operation and execute atomic stock shifts"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Validate</span>
                          </button>
                        ) : isDone ? (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ledger Updated</span>
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
