"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Layers,
  Edit2,
  SlidersHorizontal,
  ChevronRight,
  X,
  Building,
} from "lucide-react";
import { Product, Location } from "@/types";

interface ProductsViewProps {
  products: Product[];
  locations: Location[];
  onCreateProduct: (data: {
    name: string;
    sku: string;
    category: string;
    uom: string;
    minStock: number;
    description?: string;
    initialStock?: number;
    initialLocationId?: string;
  }) => Promise<void>;
  onUpdateProduct: (
    id: string,
    updates: Partial<Pick<Product, "name" | "sku" | "category" | "uom" | "minStock" | "description">>
  ) => Promise<void>;
  onOpenAdjustmentForProduct: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  locations,
  onCreateProduct,
  onUpdateProduct,
  onOpenAdjustmentForProduct,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Raw Materials",
    uom: "Units",
    minStock: 10,
    description: "",
    initialStock: 0,
    initialLocationId: locations.find((l) => l.type === "INTERNAL")?.id || "",
  });

  const categories = ["ALL", "Raw Materials", "Finished Goods", "Furniture", "Electronics", "Fasteners"];

  const filteredProducts = products.filter((p) => {
    let match = true;
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) match = false;
    if (search) {
      const q = search.toLowerCase();
      match = match && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return match;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateProduct(formData);
    setShowCreateModal(false);
    setFormData({
      name: "",
      sku: "",
      category: "Raw Materials",
      uom: "Units",
      minStock: 10,
      description: "",
      initialStock: 0,
      initialLocationId: locations.find((l) => l.type === "INTERNAL")?.id || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await onUpdateProduct(editingProduct.id, {
      name: editingProduct.name,
      sku: editingProduct.sku,
      category: editingProduct.category,
      uom: editingProduct.uom,
      minStock: Number(editingProduct.minStock),
      description: editingProduct.description,
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Products & Reorder Rules</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage SKU specifications, UoMs, minimum stock reordering thresholds, and warehouse quants.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Row: Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#0FA974] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200/80 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
          />
        </div>
      </div>

      {/* Clean White Table Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Reordering Rule</th>
                <th className="py-3 px-4">Location Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredProducts.map((p) => {
                const total = p.totalStock ?? 0;
                const isOutOfStock = total <= 0;
                const isLowStock = total <= p.minStock && !isOutOfStock;
                const isExpanded = expandedProductId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-gray-50/60 transition-colors group">
                      {/* Name & Description */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#0FA974] transition-colors">
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-medium text-gray-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-semibold">
                          {p.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          {p.category}
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              isOutOfStock
                                ? "text-rose-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-gray-900"
                            }`}
                          >
                            {total} {p.uom}
                          </span>
                          {isOutOfStock && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FEECEC] text-[#DC2626] text-[10px] font-semibold">
                              Out of Stock
                            </span>
                          )}
                          {isLowStock && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FEF7E6] text-[#D97706] text-[10px] font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reordering Rule */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span>Min:</span>
                          <span className="font-mono font-bold text-gray-800">{p.minStock}</span>
                          <span className="text-gray-400">{p.uom}</span>
                        </div>
                      </td>

                      {/* Location Breakdown Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                          className="flex items-center gap-1.5 text-[11px] text-[#0FA974] hover:text-[#0d9264] font-medium py-1 px-2 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <Building className="w-3.5 h-3.5" />
                          <span>
                            {p.quants?.length || 0} {p.quants?.length === 1 ? "location" : "locations"}
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAdjustmentForProduct(p)}
                            title="Physical Count Inventory Adjustment"
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 border border-gray-200/80 transition-all"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Edit Product & Reorder Rules"
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-[#0FA974] border border-gray-200/80 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Location Breakdown Drawer */}
                    {isExpanded && (
                      <tr className="bg-gray-50/70 border-b border-gray-100">
                        <td colSpan={7} className="py-3 px-6">
                          <div className="p-4 rounded-xl bg-white border border-gray-200/80 space-y-2">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-[#0FA974]" />
                              <span>Stock Availability per Location ({p.name})</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {p.quants && p.quants.length > 0 ? (
                                p.quants.map((q, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                                  >
                                    <div>
                                      <p className="text-xs font-medium text-gray-900">{q.locationName}</p>
                                      <p className="text-[10px] text-gray-400">{q.warehouseName}</p>
                                    </div>
                                    <span className="font-mono font-bold text-xs text-[#0FA974] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                                      {q.quantity} {p.uom}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400 italic py-1">No stock currently recorded.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Product */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0FA974]" />
                <h3 className="text-base font-bold text-gray-900">Create New Product</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steel Rods 12mm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STL-12MM"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fasteners">Fasteners</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Unit of Measure (UoM) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Units, kg, Boxes, Liters"
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Min Stock Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>
              </div>

              {/* Initial Stock (Optional) */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="font-semibold text-gray-800">Initial Stock (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 mb-1">Initial Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initialStock}
                      onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-900 focus:outline-none focus:border-[#0FA974]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Initial Location</label>
                    <select
                      value={formData.initialLocationId}
                      onChange={(e) => setFormData({ ...formData, initialLocationId: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-900 focus:outline-none focus:border-[#0FA974] cursor-pointer"
                    >
                      {locations
                        .filter((l) => l.type === "INTERNAL")
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details, specifications or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#0FA974]" />
                <h3 className="text-base font-bold text-gray-900">Edit Product: {editingProduct.name}</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974] cursor-pointer"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fasteners">Fasteners</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.uom}
                    onChange={(e) => setEditingProduct({ ...editingProduct, uom: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Min Stock Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.minStock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0FA974]/20 focus:border-[#0FA974]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0FA974] hover:bg-[#0d9264] text-white text-xs font-semibold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
