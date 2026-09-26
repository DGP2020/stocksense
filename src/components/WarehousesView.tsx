"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  Box,
  X,
  Check,
  Building,
} from "lucide-react";
import { Warehouse, Location, Product } from "@/types";

interface WarehousesViewProps {
  warehouses: Warehouse[];
  locations: Location[];
  products: Product[];
  onCreateWarehouse: (data: { name: string; code: string; address?: string }) => Promise<void>;
}

export const WarehousesView: React.FC<WarehousesViewProps> = ({
  warehouses,
  locations,
  products,
  onCreateWarehouse,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateWarehouse({ name, code, address });
    setShowModal(false);
    setName("");
    setCode("");
    setAddress("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>Warehouses & Storage Architecture</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure multiple company warehouses and their internal storage racks, production zones, and dispatch docks.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Warehouse</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => {
          const whLocations = locations.filter((l) => l.warehouseId === wh.id);

          return (
            <div
              key={wh.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                    {wh.code}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{wh.name}</h3>
                  {wh.address && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{wh.address}</span>
                    </p>
                  )}
                </div>

                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-purple-400">
                  <Building className="w-5 h-5" />
                </div>
              </div>

              {/* Locations inside this Warehouse */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Configured Storage Zones ({whLocations.length})</span>
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {whLocations.map((loc) => {
                    // Count items in this location
                    const productsInLoc = products.filter((p) =>
                      p.quants?.some((q) => q.locationId === loc.id && q.quantity > 0)
                    );

                    return (
                      <div
                        key={loc.id}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{loc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {loc.id}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-purple-300">
                            {productsInLoc.length} {productsInLoc.length === 1 ? "SKU" : "SKUs"}
                          </span>
                          <p className="text-[10px] text-slate-500">Active stock</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Virtual & External Locations Box */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Box className="w-4 h-4 text-slate-400" />
          <span>Virtual & Counterpart Locations</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-semibold text-teal-300">Vendors / Inbound</span>
            <p className="text-slate-400 text-[11px] mt-1">Source location for incoming vendor receipts.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-semibold text-purple-300">Customers / Outbound</span>
            <p className="text-slate-400 text-[11px] mt-1">Destination location for completed customer dispatches.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-semibold text-amber-300">Virtual / Inventory Loss</span>
            <p className="text-slate-400 text-[11px] mt-1">Counterpart location for physical stock reconciliations and scrap.</p>
          </div>
        </div>
      </div>

      {/* Modal: New Warehouse */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Create New Warehouse</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Logistics Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Short Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH3 or SOUTH"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Address / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 100 Logistics Way, Bay 3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Create Warehouse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
