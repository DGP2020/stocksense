"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Check,
  History,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Product, Location } from "@/types";

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  locations: Location[];
  onRefreshData: () => Promise<void>;
  onNavigateToMoves: () => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  products,
  locations,
  onRefreshData,
  onNavigateToMoves,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);
  const [executing, setExecuting] = useState(false);

  if (!isOpen) return null;

  const steelProd = products.find((p) => p.sku === "STL-12MM") || products[0];
  const mainStoreLoc = locations.find((l) => l.name.includes("Main Store")) || locations[0];
  const prodRackLoc = locations.find((l) => l.name.includes("Production Floor")) || locations[1];

  const triggerCelebrate = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0FA974", "#3B82F6", "#F59E0B"],
      });
    } catch {}
  };

  // Step 1: Receive 100 kg Steel from Vendor
  const executeStep1 = async () => {
    setExecuting(true);
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RECEIPT",
          partnerName: "Apex Steel Mills Ltd.",
          warehouseId: "wh-1",
          sourceLocationId: "loc-vendor",
          destinationLocationId: mainStoreLoc?.id || "loc-wh1-stock",
          notes: "Hackathon Demo Step 1: Inbound Vendor Delivery",
          items: [{ productId: steelProd.id, quantity: 100 }],
        }),
      });
      const op = await res.json();
      await fetch(`/api/operations/${op.id}/validate`, { method: "POST" });
      await onRefreshData();
      setStep1Done(true);
      setActiveStep(2);
      triggerCelebrate();
    } finally {
      setExecuting(false);
    }
  };

  // Step 2: Internal Transfer: Main Store -> Production Rack (50 kg)
  const executeStep2 = async () => {
    setExecuting(true);
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INTERNAL_TRANSFER",
          partnerName: "Steel Frame Fabrication Team",
          warehouseId: "wh-1",
          sourceLocationId: mainStoreLoc?.id || "loc-wh1-stock",
          destinationLocationId: prodRackLoc?.id || "loc-wh1-prod",
          notes: "Hackathon Demo Step 2: Relocate 50 kg to Production Floor",
          items: [{ productId: steelProd.id, quantity: 50 }],
        }),
      });
      const op = await res.json();
      await fetch(`/api/operations/${op.id}/validate`, { method: "POST" });
      await onRefreshData();
      setStep2Done(true);
      setActiveStep(3);
      triggerCelebrate();
    } finally {
      setExecuting(false);
    }
  };

  // Step 3: Deliver 20 kg to Customer
  const executeStep3 = async () => {
    setExecuting(true);
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DELIVERY",
          partnerName: "Metro Highrise Construction",
          warehouseId: "wh-1",
          sourceLocationId: prodRackLoc?.id || "loc-wh1-prod",
          destinationLocationId: "loc-customer",
          notes: "Hackathon Demo Step 3: Deliver 20 kg finished steel",
          items: [{ productId: steelProd.id, quantity: 20 }],
        }),
      });
      const op = await res.json();
      await fetch(`/api/operations/${op.id}/validate`, { method: "POST" });
      await onRefreshData();
      setStep3Done(true);
      setActiveStep(4);
      triggerCelebrate();
    } finally {
      setExecuting(false);
    }
  };

  // Step 4: Scrap / Reconcile 3 kg Damaged items via Adjustment
  const executeStep4 = async () => {
    setExecuting(true);
    try {
      const currentQuant =
        steelProd?.quants?.find((q) => q.locationId === prodRackLoc?.id)?.quantity || 30;
      const targetCounted = Math.max(0, currentQuant - 3);

      await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: steelProd.id,
          locationId: prodRackLoc?.id || "loc-wh1-prod",
          countedQuantity: targetCounted,
          reason: "Hackathon Demo Step 4: 3 kg damaged steel rods scrap reconciliation",
        }),
      });
      await onRefreshData();
      setStep4Done(true);
      triggerCelebrate();
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0FA974] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>Official Odoo Hackathon 4-Step Scenario</span>
              </h3>
              <p className="text-xs text-gray-400">
                Execute the exact inventory lifecycle specified in the competition problem statement.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Steps Timeline Container */}
        <div className="space-y-3 text-xs">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              step1Done
                ? "bg-[#EAF8F1] border-[#A7F3D0] text-gray-800"
                : activeStep === 1
                ? "bg-gray-50 border-[#0FA974] text-gray-900"
                : "bg-gray-50/50 border-gray-200 text-gray-500 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step1Done
                      ? "bg-[#0FA974] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {step1Done ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 1: Receive Goods from Vendor</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Receive 100 kg Steel from Vendor &rarr; <span className="text-[#0FA974] font-semibold font-mono">Stock: +100</span>
                  </p>
                </div>
              </div>

              {!step1Done ? (
                <button
                  onClick={executeStep1}
                  disabled={executing}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 1</span>
                </button>
              ) : (
                <span className="text-[#0FA974] font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Executed & Ledger Logged</span>
                </span>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              step2Done
                ? "bg-[#EAF8F1] border-[#A7F3D0] text-gray-800"
                : activeStep === 2
                ? "bg-gray-50 border-[#0FA974] text-gray-900"
                : "bg-gray-50/50 border-gray-200 text-gray-500 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step2Done
                      ? "bg-[#0FA974] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {step2Done ? <Check className="w-4 h-4" /> : "2"}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 2: Move to Production Rack</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Internal transfer: Main Store &rarr; Production Rack. Total stock unchanged; location updated.
                  </p>
                </div>
              </div>

              {!step2Done ? (
                <button
                  onClick={executeStep2}
                  disabled={executing || !step1Done}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 2</span>
                </button>
              ) : (
                <span className="text-[#0FA974] font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Executed & Ledger Logged</span>
                </span>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              step3Done
                ? "bg-[#EAF8F1] border-[#A7F3D0] text-gray-800"
                : activeStep === 3
                ? "bg-gray-50 border-[#0FA974] text-gray-900"
                : "bg-gray-50/50 border-gray-200 text-gray-500 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step3Done
                      ? "bg-[#0FA974] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {step3Done ? <Check className="w-4 h-4" /> : "3"}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 3: Deliver Finished Goods</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Pick, pack, ship to customer &rarr; <span className="text-rose-600 font-semibold font-mono">Stock: -20</span>
                  </p>
                </div>
              </div>

              {!step3Done ? (
                <button
                  onClick={executeStep3}
                  disabled={executing || !step2Done}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 3</span>
                </button>
              ) : (
                <span className="text-[#0FA974] font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Executed & Ledger Logged</span>
                </span>
              )}
            </div>
          </div>

          {/* Step 4 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              step4Done
                ? "bg-[#EAF8F1] border-[#A7F3D0] text-gray-800"
                : activeStep === 4
                ? "bg-gray-50 border-[#0FA974] text-gray-900"
                : "bg-gray-50/50 border-gray-200 text-gray-500 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step4Done
                      ? "bg-[#0FA974] text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {step4Done ? <Check className="w-4 h-4" /> : "4"}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 4: Adjust Damaged Items (Physical Count)</h4>
                  <p className="text-gray-500 text-xs mt-0.5">
                    3 kg steel damaged &rarr; <span className="text-amber-600 font-semibold font-mono">Stock: -3</span>, logged to Loss account
                  </p>
                </div>
              </div>

              {!step4Done ? (
                <button
                  onClick={executeStep4}
                  disabled={executing || !step3Done}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 4</span>
                </button>
              ) : (
                <span className="text-[#0FA974] font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed & Reconciled</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <button
            onClick={() => {
              setStep1Done(false);
              setStep2Done(false);
              setStep3Done(false);
              setStep4Done(false);
              setActiveStep(1);
            }}
            className="text-gray-400 hover:text-gray-700"
          >
            Restart Walkthrough
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToMoves();
              }}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5"
            >
              <History className="w-4 h-4" />
              <span>Inspect Stock Move Ledger</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white font-semibold shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
