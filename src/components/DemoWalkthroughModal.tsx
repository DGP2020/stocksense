"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  SlidersHorizontal,
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
        colors: ["#714B67", "#017E84", "#10B981"],
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

  // Step 3: Deliver finished goods: Deliver 20 units -> Stock: -20
  const executeStep3 = async () => {
    setExecuting(true);
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DELIVERY",
          partnerName: "Metro Corporate Offices",
          warehouseId: "wh-1",
          sourceLocationId: mainStoreLoc?.id || "loc-wh1-stock",
          destinationLocationId: "loc-customer",
          notes: "Hackathon Demo Step 3: Outbound Finished Goods Delivery",
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

  // Step 4: Adjust damaged items: 3 kg steel damaged -> Stock: -3
  const executeStep4 = async () => {
    setExecuting(true);
    try {
      // Current recorded quant in prod rack
      const currentQuant = steelProd.quants?.find((q) => q.locationId === prodRackLoc?.id)?.quantity || 50;
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Official Odoo Hackathon 4-Step Scenario</span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute the exact inventory lifecycle specified in the PDF prompt.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Steps Timeline Container */}
        <div className="space-y-3 text-xs">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              step1Done
                ? "bg-slate-950/70 border-emerald-500/40 text-slate-300"
                : activeStep === 1
                ? "bg-teal-500/10 border-teal-500/50 text-white"
                : "bg-slate-800/40 border-slate-700/40 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step1Done
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-teal-500 text-slate-950"
                  }`}
                >
                  {step1Done ? <Check className="w-4 h-4" /> : "1"}
                </div>
                <div>
                  <h4 className="font-bold text-sm">Step 1: Receive Goods from Vendor</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Receive 100 kg Steel from Vendor &rarr; <span className="text-teal-300 font-semibold font-mono">Stock: +100</span>
                  </p>
                </div>
              </div>

              {!step1Done ? (
                <button
                  onClick={executeStep1}
                  disabled={executing}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 1</span>
                </button>
              ) : (
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
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
                ? "bg-slate-950/70 border-emerald-500/40 text-slate-300"
                : activeStep === 2
                ? "bg-purple-500/10 border-purple-500/50 text-white"
                : "bg-slate-800/40 border-slate-700/40 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step2Done
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {step2Done ? <Check className="w-4 h-4" /> : "2"}
                </div>
                <div>
                  <h4 className="font-bold text-sm">Step 2: Move to Production Rack</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Internal transfer: Main Store &rarr; Production Rack. Total stock unchanged; location updated.
                  </p>
                </div>
              </div>

              {!step2Done ? (
                <button
                  onClick={executeStep2}
                  disabled={executing || !step1Done}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 2</span>
                </button>
              ) : (
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
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
                ? "bg-slate-950/70 border-emerald-500/40 text-slate-300"
                : activeStep === 3
                ? "bg-purple-500/10 border-purple-500/50 text-white"
                : "bg-slate-800/40 border-slate-700/40 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step3Done
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {step3Done ? <Check className="w-4 h-4" /> : "3"}
                </div>
                <div>
                  <h4 className="font-bold text-sm">Step 3: Deliver Finished Goods</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Pick, pack, ship to customer &rarr; <span className="text-rose-300 font-semibold font-mono">Stock: -20</span>
                  </p>
                </div>
              </div>

              {!step3Done ? (
                <button
                  onClick={executeStep3}
                  disabled={executing || !step2Done}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 3</span>
                </button>
              ) : (
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
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
                ? "bg-slate-950/70 border-emerald-500/40 text-slate-300"
                : activeStep === 4
                ? "bg-amber-500/10 border-amber-500/50 text-white"
                : "bg-slate-800/40 border-slate-700/40 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step4Done
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {step4Done ? <Check className="w-4 h-4" /> : "4"}
                </div>
                <div>
                  <h4 className="font-bold text-sm">Step 4: Adjust Damaged Items (Physical Count)</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    3 kg steel damaged &rarr; <span className="text-amber-300 font-semibold font-mono">Stock: -3</span>, logged to Loss account
                  </p>
                </div>
              </div>

              {!step4Done ? (
                <button
                  onClick={executeStep4}
                  disabled={executing || !step3Done}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Step 4</span>
                </button>
              ) : (
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed & Reconciled</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <button
            onClick={() => {
              setStep1Done(false);
              setStep2Done(false);
              setStep3Done(false);
              setStep4Done(false);
              setActiveStep(1);
            }}
            className="text-slate-400 hover:text-white"
          >
            Restart Walkthrough
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToMoves();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1.5"
            >
              <History className="w-4 h-4" />
              <span>Inspect Stock Move Ledger</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
