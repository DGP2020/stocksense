"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  RotateCcw,
  Package,
} from "lucide-react";
import { StockMove, OperationType } from "@/types";

interface MoveHistoryViewProps {
  moves: StockMove[];
}

export const MoveHistoryView: React.FC<MoveHistoryViewProps> = ({ moves }) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filteredMoves = moves.filter((m) => {
    let match = true;
    if (selectedType !== "ALL" && m.type !== selectedType) match = false;
    if (search) {
      const q = search.toLowerCase();
      const inProd = m.productName?.toLowerCase().includes(q) ?? false;
      const inSku = m.productSku?.toLowerCase().includes(q) ?? false;
      const inRef = m.reference?.toLowerCase().includes(q) ?? false;
      const inSrc = m.sourceName?.toLowerCase().includes(q) ?? false;
      const inDst = m.destinationName?.toLowerCase().includes(q) ?? false;
      match = match && (inProd || inSku || inRef || inSrc || inDst);
    }
    return match;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Move History & Audit Ledger</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Double-entry audit trail tracking every single inventory increment, dispatch, transfer, and adjustment.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
          >
            <option value="ALL">All Operation Types</option>
            <option value="RECEIPT">Receipts (Incoming)</option>
            <option value="DELIVERY">Delivery Orders (Outgoing)</option>
            <option value="INTERNAL_TRANSFER">Internal Transfers</option>
            <option value="ADJUSTMENT">Stock Adjustments</option>
          </select>

          {selectedType !== "ALL" && (
            <button
              onClick={() => setSelectedType("ALL")}
              className="text-xs text-gray-400 hover:text-gray-700"
              title="Reset Filter"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reference, product, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
          />
        </div>
      </div>

      {/* Ledger Clean White Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900">
            Audit Trail ({filteredMoves.length} recorded movements)
          </span>
          <span className="text-[11px] text-gray-400">Chronological / Newest First</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredMoves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 italic">
                    No stock movements found in ledger.
                  </td>
                </tr>
              ) : (
                filteredMoves.map((m) => {
                  let typeIcon = Package;
                  let typePill = "bg-gray-100 text-gray-700";

                  if (m.type === "RECEIPT") {
                    typeIcon = ArrowDownLeft;
                    typePill = "bg-[#EAF8F1] text-[#0FA974]";
                  } else if (m.type === "DELIVERY") {
                    typeIcon = ArrowUpRight;
                    typePill = "bg-[#EFF6FF] text-[#2563EB]";
                  } else if (m.type === "INTERNAL_TRANSFER") {
                    typeIcon = ArrowLeftRight;
                    typePill = "bg-[#F3E8FF] text-[#9333EA]";
                  } else if (m.type === "ADJUSTMENT") {
                    typeIcon = SlidersHorizontal;
                    typePill = "bg-[#FEF7E6] text-[#D97706]";
                  }

                  const IconC = typeIcon;

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-4 font-semibold text-[#0FA974] whitespace-nowrap">
                        {m.reference || `MOV-${m.id.substring(0, 8)}`}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${typePill}`}>
                          <IconC className="w-3 h-3" />
                          <span>{m.type?.replace("_", " ") || "TRANSFER"}</span>
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">{m.productName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{m.productSku}</p>
                        </div>
                      </td>

                      {/* From Location */}
                      <td className="py-3 px-4 text-gray-600">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-[11px]">
                          {m.sourceName}
                        </span>
                      </td>

                      {/* To Location */}
                      <td className="py-3 px-4 text-gray-600">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[11px] text-[#0FA974] font-medium">
                          {m.destinationName}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-sm">
                        <span className="text-[#0FA974]">
                          +{m.quantity}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
