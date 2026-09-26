"use client";

import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Check,
  CheckCircle2,
  Package,
  X,
  Trash2,
  Truck,
  Box,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  Operation,
  OperationType,
  Product,
  Location,
  Warehouse,
} from "@/types";

interface OperationsViewProps {
  type: OperationType;
  operations: Operation[];
  products: Product[];
  locations: Location[];
  warehouses: Warehouse[];
  onValidateOperation: (id: string) => Promise<void>;
  onCreateOperation: (data: {
    type: OperationType;
    partnerName?: string;
    warehouseId?: string;
    sourceLocationId?: string;
    destinationLocationId?: string;
    notes?: string;
    items: { productId: string; quantity: number; sourceId?: string; destinationId?: string }[];
  }) => Promise<void>;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
  type,
  operations,
  products,
  locations,
  warehouses,
  onValidateOperation,
  onCreateOperation,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [partnerName, setPartnerName] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [destinationLocationId, setDestinationLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    { productId: string; quantity: number; sourceId?: string; destinationId?: string }[]
  >([{ productId: products[0]?.id || "", quantity: 10 }]);

  // Filter operations for this specific type
  const typeOps = operations.filter((o) => o.type === type);

  let title = "Operations";
  let subtitle = "Manage stock movements";
  let icon = Package;
  let partnerLabel = "Partner";
  let defaultSource = "loc-vendor";
  let defaultDest = "loc-wh1-stock";

  if (type === "RECEIPT") {
    title = "Receipts (Incoming Stock)";
    subtitle = "Log incoming vendor deliveries. Validating automatically increments destination stock.";
    icon = ArrowDownLeft;
    partnerLabel = "Vendor / Supplier Name *";
    defaultSource = "loc-vendor";
    defaultDest = locations.find((l) => l.type === "INTERNAL")?.id || "loc-wh1-stock";
  } else if (type === "DELIVERY") {
    title = "Delivery Orders (Outgoing Goods)";
    subtitle = "Pick, pack and ship customer orders. Validating decrements stock upon dispatch.";
    icon = ArrowUpRight;
    partnerLabel = "Customer Name *";
    defaultSource = locations.find((l) => l.type === "INTERNAL")?.id || "loc-wh1-stock";
    defaultDest = "loc-customer";
  } else if (type === "INTERNAL_TRANSFER") {
    title = "Internal Transfers";
    subtitle = "Relocate items between internal warehouse zones (Main Store, Production Rack, Rack A/B).";
    icon = ArrowLeftRight;
    partnerLabel = "Department / Project Reference";
    defaultSource = locations.find((l) => l.type === "INTERNAL")?.id || "loc-wh1-stock";
    defaultDest = locations.filter((l) => l.type === "INTERNAL")[1]?.id || "loc-wh1-prod";
  }

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || "", quantity: 10 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleValidate = async (id: string) => {
    await onValidateOperation(id);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0FA974", "#3B82F6", "#F59E0B"],
      });
    } catch {
      // safe fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateOperation({
      type,
      partnerName: partnerName || undefined,
      warehouseId,
      sourceLocationId: sourceLocationId || defaultSource,
      destinationLocationId: destinationLocationId || defaultDest,
      notes,
      items: items.map((i) => ({
        ...i,
        sourceId: sourceLocationId || defaultSource,
        destinationId: destinationLocationId || defaultDest,
      })),
    });

    setShowModal(false);
    setPartnerName("");
    setNotes("");
    setItems([{ productId: products[0]?.id || "", quantity: 10 }]);
  };

  const avatarColors = [
    "bg-emerald-100 text-emerald-800",
    "bg-blue-100 text-blue-800",
    "bg-amber-100 text-amber-800",
    "bg-purple-100 text-purple-800",
    "bg-rose-100 text-rose-800",
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <button
          onClick={() => {
            setSourceLocationId(defaultSource);
            setDestinationLocationId(defaultDest);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>
            {type === "RECEIPT"
              ? "New Receipt"
              : type === "DELIVERY"
              ? "New Delivery Order"
              : "New Internal Transfer"}
          </span>
        </button>
      </div>

      {/* SOP Guide Card */}
      <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs text-gray-600">
        <p className="font-semibold text-gray-900 mb-2.5 flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#0FA974]" />
          <span>Standard Operating Procedure</span>
        </p>
        {type === "RECEIPT" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">1. Create Receipt:</span> Specify vendor & target warehouse
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">2. Input Items:</span> Add products and quantities
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">3. Verification:</span> Physical dock inspection
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-bold text-[#0FA974]">4. Validate:</span> Auto-increments stock in ledger
            </div>
          </div>
        )}
        {type === "DELIVERY" && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">1. Sales Order:</span> Select customer & items
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">2. Pick Items:</span> Warehouse staff picks from rack
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">3. Pack & Seal:</span> Package at dispatch bay
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-bold text-[#0FA974]">4. Validate:</span> Auto-decrements stock upon dispatch
            </div>
          </div>
        )}
        {type === "INTERNAL_TRANSFER" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">1. Select Seams:</span> Source & Destination zones
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="font-bold text-gray-900">2. Relocation:</span> Physical transport between racks
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-bold text-[#0FA974]">3. Validate:</span> Ledger updates locations
            </div>
          </div>
        )}
      </div>

      {/* Operations Clean White Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-gray-300 text-[#0FA974] focus:ring-[#0FA974]" />
                </th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">
                  {type === "RECEIPT" ? "Vendor / Supplier" : type === "DELIVERY" ? "Customer" : "Department"}
                </th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {typeOps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No {title.toLowerCase()} recorded yet. Click above to create one.
                  </td>
                </tr>
              ) : (
                typeOps.map((op, index) => {
                  const isDone = op.status === "DONE";
                  const firstMove = op.moves[0];
                  const partner = op.partnerName || "Internal Transfer";
                  const initial = partner.charAt(0).toUpperCase();
                  const avatarColor = avatarColors[index % avatarColors.length];

                  return (
                    <tr key={op.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="py-3 px-4">
                        <input type="checkbox" className="rounded border-gray-300 text-[#0FA974] focus:ring-[#0FA974]" />
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0FA974] whitespace-nowrap">
                        {op.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                            {initial}
                          </div>
                          <span className="font-semibold text-gray-900">{partner}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {firstMove?.sourceName || "Vendor Dock"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {firstMove?.destinationName || "Customer Dock"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {op.moves.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-800">{m.productName}</span>
                              <span className="text-gray-400 font-mono text-[11px]">({m.quantity} qty)</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                            op.status === "DONE"
                              ? "bg-[#EAF8F1] text-[#0FA974]"
                              : op.status === "WAITING"
                              ? "bg-[#FEF7E6] text-[#D97706]"
                              : op.status === "READY"
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : "bg-[#FEECEC] text-[#DC2626]"
                          }`}
                        >
                          {op.status === "DONE" ? "Completed" : op.status === "READY" ? "Ready" : op.status === "WAITING" ? "Pending" : "Canceled"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-[11px]">
                        {new Date(op.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isDone && op.status !== "CANCELED" ? (
                          <button
                            onClick={() => handleValidate(op.id)}
                            className="px-3 py-1 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ml-auto"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Validate</span>
                          </button>
                        ) : isDone ? (
                          <span className="inline-flex items-center gap-1 text-[#0FA974] text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed</span>
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
      </div>

      {/* Modal: Create New Operation */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0FA974]" />
                <h3 className="text-base font-bold text-gray-900">Create {title}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">{partnerLabel}</label>
                  <input
                    type="text"
                    required={type !== "INTERNAL_TRANSFER"}
                    placeholder={
                      type === "RECEIPT"
                        ? "e.g. Apex Industrial Supplies"
                        : type === "DELIVERY"
                        ? "e.g. Metro Builders Ltd."
                        : "e.g. Assembly Floor Dept"
                    }
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Target Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source & Destination Locations */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Source Location *</label>
                  <select
                    value={sourceLocationId}
                    onChange={(e) => setSourceLocationId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
                  >
                    {type === "RECEIPT" ? (
                      <option value="loc-vendor">Vendors / Inbound Dock</option>
                    ) : (
                      locations
                        .filter((l) => l.type === "INTERNAL")
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Destination Location *</label>
                  <select
                    value={destinationLocationId}
                    onChange={(e) => setDestinationLocationId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
                  >
                    {type === "DELIVERY" ? (
                      <option value="loc-customer">Customers / Outbound Bay</option>
                    ) : (
                      locations
                        .filter((l) => l.type === "INTERNAL")
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))
                    )}
                  </select>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-[#0FA974]" />
                    <span>Product Lines</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[#0FA974] hover:text-[#0d9264] text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const selProd = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200/80"
                      >
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].productId = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-900 focus:outline-none focus:border-[#0FA974]"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) - Avail: {p.totalStock} {p.uom}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].quantity = Number(e.target.value);
                              setItems(newItems);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-900 text-right focus:outline-none focus:border-[#0FA974]"
                          />
                        </div>

                        <span className="text-[11px] text-gray-500 w-12 text-center">
                          {selProd?.uom || "qty"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="p-1 text-gray-400 hover:text-rose-500 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inspect pallet seals on dock arrival, fragility notes, dispatch priority"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
