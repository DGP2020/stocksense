"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Building,
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
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <span>Immutable Stock Movement Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Double-entry audit trail tracking every single inventory increment, dispatch, transfer, and adjustment.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
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
              className="text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, product, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white">
            Audit Trail ({filteredMoves.length} recorded movements)
          </span>
          <span className="text-[11px] text-slate-400">Chronological / Newest First</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredMoves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                    No stock movements found in ledger.
                  </td>
                </tr>
              ) : (
                filteredMoves.map((m) => {
                  let typeIcon = Package;
                  let typePill = "bg-slate-800 text-slate-300 border-slate-700";

                  if (m.type === "RECEIPT") {
                    typeIcon = ArrowDownLeft;
                    typePill = "bg-teal-500/15 text-teal-300 border-teal-500/30";
                  } else if (m.type === "DELIVERY") {
                    typeIcon = ArrowUpRight;
                    typePill = "bg-purple-500/15 text-purple-300 border-purple-500/30";
                  } else if (m.type === "INTERNAL_TRANSFER") {
                    typeIcon = ArrowLeftRight;
                    typePill = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
                  } else if (m.type === "ADJUSTMENT") {
                    typeIcon = SlidersHorizontal;
                    typePill = "bg-amber-500/15 text-amber-300 border-amber-500/30";
                  }

                  const IconC = typeIcon;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap font-sans">
                        {new Date(m.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-4 font-bold text-purple-300 whitespace-nowrap">
                        {m.reference || `MOV-${m.id.substring(0, 8)}`}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 whitespace-nowrap font-sans">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typePill}`}>
                          <IconC className="w-3 h-3" />
                          <span>{m.type?.replace("_", " ") || "TRANSFER"}</span>
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4 font-sans">
                        <div>
                          <p className="font-semibold text-white">{m.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.productSku}</p>
                        </div>
                      </td>

                      {/* From Location */}
                      <td className="py-3 px-4 text-slate-300 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px]">
                          {m.sourceName}
                        </span>
                      </td>

                      {/* To Location */}
                      <td className="py-3 px-4 text-slate-300 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-teal-300">
                          {m.destinationName}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-sm">
                        <span className="text-emerald-400">
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
