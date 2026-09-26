"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Package,
  Building,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Product, Location, Operation } from "@/types";

interface AdjustmentsViewProps {
  products: Product[];
  locations: Location[];
  operations: Operation[];
  preselectedProduct?: Product | null;
  onApplyAdjustment: (data: {
    productId: string;
    locationId: string;
    countedQuantity: number;
    reason?: string;
  }) => Promise<void>;
}

export const AdjustmentsView: React.FC<AdjustmentsViewProps> = ({
  products,
  locations,
  operations,
  preselectedProduct,
  onApplyAdjustment,
}) => {
  const internalLocations = locations.filter((l) => l.type === "INTERNAL");

  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || products[0]?.id || ""
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    internalLocations[0]?.id || ""
  );
  const [countedQty, setCountedQty] = useState<number>(0);
  const [reason, setReason] = useState("Damaged goods / Physical cycle count");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the selected product and calculate recorded stock at this specific location
  const currentProduct = products.find((p) => p.id === selectedProductId);

  // Look for current quant at selected location
  const currentQuant = currentProduct?.quants?.find((q) => q.locationId === selectedLocationId);
  const recordedQuantity = currentQuant?.quantity || 0;

  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProductId(preselectedProduct.id);
    }
  }, [preselectedProduct]);

  useEffect(() => {
    setCountedQty(recordedQuantity);
  }, [selectedProductId, selectedLocationId, recordedQuantity]);

  const difference = countedQty - recordedQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedLocationId) return;

    setIsSubmitting(true);
    try {
      await onApplyAdjustment({
        productId: selectedProductId,
        locationId: selectedLocationId,
        countedQuantity: Number(countedQty),
        reason,
      });

      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#714B67", "#F59E0B", "#10B981"],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustmentOps = operations.filter((o) => o.type === "ADJUSTMENT");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-amber-400" />
          <span>Physical Inventory Adjustments</span>
        </h2>
        <p className="text-xs text-slate-400">
          Reconcile discrepancies between recorded system balances and physical counts. Automated ledger movements are logged to audit scrap, damage, or found stock.
        </p>
      </div>

      {/* Interactive Adjustment Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            <span>Reconciliation Console</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Select Product *</label>
                <div className="relative">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location Selector */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Target Location *</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {internalLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reconciliation Comparison Display Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Recorded Quantity */}
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-slate-400 font-medium">System Recorded Stock</span>
                <div className="text-xl font-mono font-bold text-slate-200 mt-1">
                  {recordedQuantity} {currentProduct?.uom || "units"}
                </div>
                <span className="text-[10px] text-slate-500">Current quant in location</span>
              </div>

              {/* Physical Count Input */}
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-purple-300 font-semibold">Physical Counted Stock *</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={countedQty}
                    onChange={(e) => setCountedQty(Number(e.target.value))}
                    className="w-28 bg-slate-800 border border-purple-500/50 rounded-lg px-3 py-1.5 font-mono text-base font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <span className="text-xs text-slate-400 font-mono">
                    {currentProduct?.uom || "units"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Actual count on shelf</span>
              </div>

              {/* Real-Time Calculated Difference */}
              <div className="text-center sm:text-right p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Reconciliation Variance</span>
                <div className="flex items-center justify-center sm:justify-end gap-1 mt-1">
                  {difference > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : difference < 0 ? (
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  ) : null}
                  <span
                    className={`text-xl font-mono font-bold ${
                      difference > 0
                        ? "text-emerald-400"
                        : difference < 0
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference}{" "}
                    {currentProduct?.uom || "units"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {difference === 0
                    ? "In Perfect Balance"
                    : difference > 0
                    ? "Surplus Inventory Found"
                    : "Shrinkage / Damage Loss"}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Reason / Audit Reference
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. 3 kg steel rods damaged by water exposure on Rack B"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Log Adjustment to Ledger</span>
              </button>
            </div>
          </form>
        </div>

        {/* Hackathon Example Info Box */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Odoo IMS Requirement</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              &quot;Stock Adjustments fix mismatches between recorded stock and physical count. Steps: Select product/location, enter counted quantity, system auto-updates and logs the adjustment.&quot;
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-[11px]">
              <span className="font-semibold text-purple-300">Hackathon Example Flow:</span>
              <p className="text-slate-400">
                100 kg Steel received &rarr; 50 kg moved to Production Rack &rarr; 20 kg delivered &rarr; <strong className="text-amber-300">3 kg steel damaged</strong> &rarr; Counted stock = 27 kg &rarr; System logs <strong>-3 kg</strong> adjustment.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Virtual Loss account auto-balanced</span>
          </div>
        </div>
      </div>

      {/* Adjustments History Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Adjustments Audit Log ({adjustmentOps.length})
          </h3>
          <p className="text-xs text-slate-400">All historical physical count reconciliations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Discrepancy (Δ)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {adjustmentOps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No adjustment operations logged yet.
                  </td>
                </tr>
              ) : (
                adjustmentOps.map((op) => {
                  const move = op.moves[0];
                  return (
                    <tr key={op.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {op.reference}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {move?.productName} ({move?.productSku})
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {op.notes}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {move?.quantity} qty
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Reconciled
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(op.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
