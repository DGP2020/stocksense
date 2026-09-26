"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
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
        colors: ["#0FA974", "#F59E0B", "#3B82F6"],
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
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>Physical Inventory Adjustments</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Reconcile discrepancies between recorded ledger balances and physical shelf counts.
        </p>
      </div>

      {/* Interactive Adjustment Form Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#0FA974]" />
            <span>Reconciliation Console</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Selector */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Select Product *</label>
                <div className="relative">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
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
                <label className="block font-medium text-gray-700 mb-1">Target Location *</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
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
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Recorded Quantity */}
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-gray-500 font-medium">System Recorded Stock</span>
                <div className="text-xl font-mono font-bold text-gray-900 mt-1">
                  {recordedQuantity} {currentProduct?.uom || "units"}
                </div>
                <span className="text-[10px] text-gray-400">Current quant in location</span>
              </div>

              {/* Physical Count Input */}
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-gray-700 font-semibold">Physical Counted Stock *</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={countedQty}
                    onChange={(e) => setCountedQty(Number(e.target.value))}
                    className="w-28 bg-white border border-gray-300 rounded-xl px-3 py-1.5 font-mono text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {currentProduct?.uom || "units"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">Actual count on shelf</span>
              </div>

              {/* Real-Time Calculated Difference */}
              <div className="text-center sm:text-right p-3 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                <span className="text-[11px] text-gray-500 font-medium">Variance</span>
                <div className="flex items-center justify-center sm:justify-end gap-1 mt-1">
                  {difference > 0 ? (
                    <TrendingUp className="w-4 h-4 text-[#0FA974]" />
                  ) : difference < 0 ? (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  ) : null}
                  <span
                    className={`text-xl font-mono font-bold ${
                      difference > 0
                        ? "text-[#0FA974]"
                        : difference < 0
                        ? "text-rose-500"
                        : "text-gray-600"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference}{" "}
                    {currentProduct?.uom || "units"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {difference === 0
                    ? "In Perfect Balance"
                    : difference > 0
                    ? "Surplus Stock Found"
                    : "Shrinkage / Damage Loss"}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Reason / Audit Reference
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. 3 kg steel rods damaged by water exposure on Rack B"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white font-semibold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Reconcile Ledger</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0FA974] mb-2.5">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Standard Rule</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Stock adjustments correct mismatches between recorded ledger figures and physical inventory counts.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 text-[11px]">
              <span className="font-semibold text-gray-900">Hackathon Example Flow:</span>
              <p className="text-gray-500">
                100 kg Steel received &rarr; 50 kg moved &rarr; 20 kg delivered &rarr; <strong className="text-amber-600">3 kg steel damaged</strong> &rarr; Counted stock = 27 kg &rarr; System logs <strong>-3 kg</strong> adjustment.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0FA974]"></span>
            <span>Virtual Loss account auto-balanced</span>
          </div>
        </div>
      </div>

      {/* Adjustments History Clean White Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Adjustments Audit Log ({adjustmentOps.length})
          </h3>
          <p className="text-xs text-gray-400">All historical physical count reconciliations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Discrepancy (Δ)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {adjustmentOps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    No adjustment operations logged yet.
                  </td>
                </tr>
              ) : (
                adjustmentOps.map((op) => {
                  const move = op.moves[0];
                  return (
                    <tr key={op.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#0FA974]">
                        {op.reference}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {move?.productName} ({move?.productSku})
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {op.notes}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {move?.quantity} qty
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF8F1] text-[#0FA974]">
                          Reconciled
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
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
