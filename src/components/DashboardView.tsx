"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
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

// Dot matrix visual helper matching the reference image cards
const DotMatrix: React.FC<{ activeColor: string }> = ({ activeColor }) => {
  const columns = [
    [true, false, false],
    [true, true, false],
    [true, true, true],
    [true, true, false],
    [true, true, true],
    [true, true, true],
    [true, true, false],
  ];

  return (
    <div className="flex gap-[6px] items-end">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col-reverse gap-[6px]">
          {col.map((active, j) => (
            <span
              key={j}
              className={`w-[6px] h-[6px] rounded-full transition-all ${
                active ? activeColor : "bg-gray-100"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  operations,
  locations: _locations,
  selectedDocType,
  onSelectDocType,
  selectedStatus,
  onSelectStatus,
  selectedLocationId: _selectedLocationId,
  onSelectLocationId: _onSelectLocationId,
  selectedCategory: _selectedCategory,
  onSelectCategory: _onSelectCategory,
  onValidateOperation,
  onNavigateTab,
  onOpenNewOperation,
  onOpenDemo: _onOpenDemo,
}) => {
  const [tableSearch, setTableSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleValidate = async (id: string) => {
    await onValidateOperation(id);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0FA974", "#059669", "#10B981"],
      });
    } catch {}
  };

  const filteredOps = operations.filter((op) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    const inRef = op.reference.toLowerCase().includes(q);
    const inPartner = (op.partnerName || "").toLowerCase().includes(q);
    const inMoves = op.moves.some(
      (m) =>
        (m.productName || "").toLowerCase().includes(q) ||
        (m.productSku || "").toLowerCase().includes(q)
    );
    return inRef || inPartner || inMoves;
  });

  const totalPages = Math.ceil(filteredOps.length / pageSize) || 1;
  const pagedOps = filteredOps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === pagedOps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pagedOps.map((o) => o.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Avatar generator helper
  const getAvatarColor = (name: string) => {
    const colors = [
      "from-emerald-500 to-teal-700",
      "from-blue-500 to-indigo-700",
      "from-purple-500 to-pink-700",
      "from-amber-500 to-orange-700",
      "from-rose-500 to-red-700",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-[24px]">
      {/* Title & Top Action Buttons matching Interoly */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[18px]">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900 tracking-[-0.02em] leading-[24px]">
            All Inventory Operations
          </h1>
        </div>

        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => onNavigateTab("receipts")}
            className="px-[18px] py-[6px] rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
          >
            In Transit Receives
          </button>

          <button
            onClick={() => onOpenNewOperation("RECEIPT")}
            className="flex items-center gap-[6px] px-[18px] py-[6px] rounded-xl bg-[#0FA974] hover:bg-[#0c8f62] text-white text-xs font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Stat Cards matching Interoly template */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {/* Card 1: Total Products in Stock */}
        <div
          onClick={() => onNavigateTab("products")}
          className="p-[18px] rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-medium text-gray-500">Total Products in Stock</span>
            <div className="mt-[6px] text-[28px] font-extrabold text-gray-900 tracking-tight tabular-nums font-mono">
              {kpis ? kpis.totalQuantityInStock : "--"}
            </div>
          </div>

          <div className="mt-[18px] flex items-end justify-between">
            <div className="inline-flex items-center gap-[6px] text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-[12px] py-[3px] rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{kpis ? kpis.totalProductsCount : 0} SKUs</span>
            </div>

            <DotMatrix activeColor="bg-[#0FA974]" />
          </div>
        </div>

        {/* Card 2: Pending Receipts */}
        <div
          onClick={() => onNavigateTab("receipts")}
          className="p-[18px] rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-medium text-gray-500">Pending Receipts</span>
            <div className="mt-[6px] text-[28px] font-extrabold text-gray-900 tracking-tight tabular-nums font-mono">
              {kpis ? kpis.pendingReceiptsCount : "--"}
            </div>
          </div>

          <div className="mt-[18px] flex items-end justify-between">
            <div className="inline-flex items-center gap-[6px] text-[11px] font-semibold text-blue-600 bg-blue-50 px-[12px] py-[3px] rounded-full border border-blue-100">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Inbound</span>
            </div>

            <DotMatrix activeColor="bg-[#3B82F6]" />
          </div>
        </div>

        {/* Card 3: Pending Deliveries */}
        <div
          onClick={() => onNavigateTab("deliveries")}
          className="p-[18px] rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-medium text-gray-500">Pending Deliveries</span>
            <div className="mt-[6px] text-[28px] font-extrabold text-gray-900 tracking-tight tabular-nums font-mono">
              {kpis ? kpis.pendingDeliveriesCount : "--"}
            </div>
          </div>

          <div className="mt-[18px] flex items-end justify-between">
            <div className="inline-flex items-center gap-[6px] text-[11px] font-semibold text-amber-600 bg-amber-50 px-[12px] py-[3px] rounded-full border border-amber-100">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pick & Pack</span>
            </div>

            <DotMatrix activeColor="bg-[#F59E0B]" />
          </div>
        </div>

        {/* Card 4: Low Stock / Out of Stock Items */}
        <div
          onClick={() => onNavigateTab("products")}
          className="p-[18px] rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-medium text-gray-500">Stock Reorder Alerts</span>
            <div className="mt-[6px] text-[28px] font-extrabold text-gray-900 tracking-tight tabular-nums font-mono">
              {kpis ? kpis.lowStockCount : "--"}
            </div>
          </div>

          <div className="mt-[18px] flex items-end justify-between">
            <div className="inline-flex items-center gap-[6px] text-[11px] font-semibold text-rose-600 bg-rose-50 px-[12px] py-[3px] rounded-full border border-rose-100">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{kpis?.outOfStockCount || 0} Out</span>
            </div>

            <DotMatrix activeColor="bg-[#EF4444]" />
          </div>
        </div>
      </div>

      {/* Main Table Card matching Interoly template */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-[18px] border-b border-gray-100 flex items-center justify-between gap-[18px] flex-wrap">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-[36px] pr-[12px] py-[6px] bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0FA974] transition-all"
            />
          </div>

          {/* Filter By Button */}
          <div className="flex items-center gap-[12px]">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-[6px] px-[12px] py-[6px] rounded-xl border text-xs font-medium transition-all ${
                showFilters || selectedDocType !== "ALL" || selectedStatus !== "ALL"
                  ? "bg-gray-100 border-gray-300 text-gray-900"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Filter by</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="p-[18px] bg-gray-50/70 border-b border-gray-100 flex items-center gap-[18px] flex-wrap text-xs">
            <div className="flex items-center gap-[6px]">
              <span className="text-gray-500 font-medium">Type:</span>
              <select
                value={selectedDocType}
                onChange={(e) => onSelectDocType(e.target.value as any)}
                className="bg-white border border-gray-200 rounded-lg px-[12px] py-[6px] text-xs text-gray-800 cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="RECEIPT">Receipts</option>
                <option value="DELIVERY">Deliveries</option>
                <option value="INTERNAL_TRANSFER">Transfers</option>
                <option value="ADJUSTMENT">Adjustments</option>
              </select>
            </div>

            <div className="flex items-center gap-[6px]">
              <span className="text-gray-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => onSelectStatus(e.target.value as any)}
                className="bg-white border border-gray-200 rounded-lg px-[12px] py-[6px] text-xs text-gray-800 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="WAITING">Waiting</option>
                <option value="READY">Ready</option>
                <option value="DONE">Done</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <button
              onClick={() => {
                onSelectDocType("ALL");
                onSelectStatus("ALL");
              }}
              className="text-gray-500 hover:text-gray-900 text-xs flex items-center gap-[6px] ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Clean Data Table matching Interoly screenshot */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-medium text-[11px]">
                <th className="py-[12px] px-[18px] w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === pagedOps.length && pagedOps.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#0FA974] focus:ring-[#0FA974] cursor-pointer"
                  />
                </th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Operation Order</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Date</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Contact / Partner</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Reference</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Items / Product</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Quantity</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600">Status</th>
                <th className="py-[12px] px-[18px] font-semibold text-gray-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {pagedOps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-[48px] text-center text-gray-400 italic">
                    No operations found.
                  </td>
                </tr>
              ) : (
                pagedOps.map((op, idx) => {
                  const isChecked = selectedIds.includes(op.id);
                  const isDone = op.status === "DONE";
                  const partner = op.partnerName || "Internal Floor";
                  const avatarColor = getAvatarColor(partner);
                  const firstMove = op.moves[0];

                  // Status badge matching Interoly style
                  let statusBadge = "bg-gray-100 text-gray-600 border border-gray-200";
                  if (op.status === "DONE" || op.status === "READY") {
                    statusBadge = "bg-[#EAF8F1] text-[#0FA974] border border-[#CDEEDF]";
                  } else if (op.status === "WAITING") {
                    statusBadge = "bg-[#FEF7E6] text-[#D97706] border border-[#FEEBC8]";
                  } else if (op.status === "DRAFT" || op.status === "CANCELED") {
                    statusBadge = "bg-[#FEECEC] text-[#E02424] border border-[#FCD9D9]";
                  }

                  return (
                    <tr
                      key={op.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isChecked ? "bg-gray-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-[12px] px-[18px]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(op.id)}
                          className="rounded border-gray-300 text-[#0FA974] focus:ring-[#0FA974] cursor-pointer"
                        />
                      </td>

                      {/* Operation Order Code */}
                      <td className="py-[12px] px-[18px] font-semibold text-[#0FA974] whitespace-nowrap font-mono">
                        {op.reference}
                      </td>

                      {/* Date */}
                      <td className="py-[12px] px-[18px] text-gray-600 whitespace-nowrap tabular-nums">
                        {new Date(op.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* Partner Name with Avatar Circle */}
                      <td className="py-[12px] px-[18px] whitespace-nowrap">
                        <div className="flex items-center gap-[12px]">
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0`}
                          >
                            {partner.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900">{partner}</span>
                        </div>
                      </td>

                      {/* Reference Badge (e.g. 1, 2, 3 in pill) */}
                      <td className="py-[12px] px-[18px]">
                        <span className="inline-flex items-center justify-center px-[6px] py-[3px] rounded-lg border border-gray-200 text-gray-600 font-mono text-[11px] font-semibold tabular-nums">
                          {idx + 1}
                        </span>
                      </td>

                      {/* Items / Product */}
                      <td className="py-[12px] px-[18px]">
                        <span className="font-medium text-gray-800">
                          {firstMove?.productName || "Product"}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-[12px] px-[18px] font-semibold text-gray-900 font-mono tabular-nums">
                        {firstMove?.quantity || 0}
                      </td>

                      {/* Status Badge */}
                      <td className="py-[12px] px-[18px] whitespace-nowrap">
                        <span
                          className={`inline-block px-[12px] py-[6px] rounded-xl text-[11px] font-semibold ${statusBadge}`}
                        >
                          {op.status === "DONE"
                            ? "Completed"
                            : op.status === "WAITING"
                            ? "Pending"
                            : op.status === "READY"
                            ? "Ready"
                            : "Issued"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-[12px] px-[18px] text-right whitespace-nowrap">
                        {!isDone && op.status !== "CANCELED" ? (
                          <button
                            onClick={() => handleValidate(op.id)}
                            className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-xl bg-[#0FA974] hover:bg-[#0c8f62] text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Validate</span>
                          </button>
                        ) : isDone ? (
                          <span className="inline-flex items-center gap-[6px] text-emerald-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Done</span>
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching Interoly template */}
        <div className="p-[18px] border-t border-gray-100 flex items-center justify-between gap-[18px] flex-wrap text-xs text-gray-500">
          {/* Pagination Buttons */}
          <div className="flex items-center gap-[6px]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-[6px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-[30px] h-[30px] rounded-lg text-xs font-semibold transition-colors tabular-nums ${
                  currentPage === i + 1
                    ? "bg-gray-100 text-gray-900 border border-gray-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-[6px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Showing Entries Info */}
          <div className="flex items-center gap-[12px] tabular-nums">
            <span>
              Showing {filteredOps.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredOps.length)} of {filteredOps.length} entries
            </span>

            <div className="px-[12px] py-[6px] rounded-lg border border-gray-200 bg-white font-medium text-gray-700">
              Show {pageSize} ⌄
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
