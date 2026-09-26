"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { ProductsView } from "@/components/ProductsView";
import { OperationsView } from "@/components/OperationsView";
import { AdjustmentsView } from "@/components/AdjustmentsView";
import { MoveHistoryView } from "@/components/MoveHistoryView";
import { WarehousesView } from "@/components/WarehousesView";
import { ProfileView } from "@/components/ProfileView";
import { DemoWalkthroughModal } from "@/components/DemoWalkthroughModal";
import {
  Product,
  Operation,
  StockMove,
  Warehouse,
  Location,
  DashboardKPIs,
  Role,
  OperationType,
  OperationStatus,
} from "@/types";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("MANAGER");

  // Global Resources
  const [products, setProducts] = useState<Product[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [moves, setMoves] = useState<StockMove[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  // Global Filters
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dashboard Specific Filters
  const [dashDocType, setDashDocType] = useState<OperationType | "ALL">("ALL");
  const [dashStatus, setDashStatus] = useState<OperationStatus | "ALL">("ALL");
  const [dashLocationId, setDashLocationId] = useState<string>("ALL");
  const [dashCategory, setDashCategory] = useState<string>("ALL");

  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [preselectedAdjProduct, setPreselectedAdjProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all core data
  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, prodRes, opsRes, movesRes, whRes, locRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/products"),
        fetch("/api/operations"),
        fetch("/api/moves"),
        fetch("/api/warehouses"),
        fetch("/api/locations"),
      ]);

      if (kpiRes.ok) setKpis(await kpiRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (opsRes.ok) setOperations(await opsRes.json());
      if (movesRes.ok) setMoves(await movesRes.json());
      if (whRes.ok) setWarehouses(await whRes.json());
      if (locRes.ok) setLocations(await locRes.json());
    } catch (e) {
      console.error("Failed to load initial data", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Operations handler: Atomic Validate
  const handleValidateOperation = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/${id}/validate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");

      showToast(`Operation ${data.operation.reference} validated! Stock movements applied.`);
      await fetchData();
    } catch (e: any) {
      alert(e.message || "Failed to validate operation");
    }
  };

  // Operations handler: Create
  const handleCreateOperation = async (payload: {
    type: OperationType;
    partnerName?: string;
    warehouseId?: string;
    sourceLocationId?: string;
    destinationLocationId?: string;
    notes?: string;
    items: { productId: string; quantity: number; sourceId?: string; destinationId?: string }[];
  }) => {
    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const op = await res.json();
      if (!res.ok) throw new Error(op.error || "Failed to create operation");

      showToast(`Created document ${op.reference} successfully.`);
      await fetchData();
    } catch (e: any) {
      alert(e.message || "Failed to create operation");
    }
  };

  // Products handler: Create
  const handleCreateProduct = async (payload: any) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      showToast(`Product "${data.name}" (${data.sku}) created!`);
      await fetchData();
    } catch (e: any) {
      alert(e.message || "Failed to create product");
    }
  };

  // Products handler: Update
  const handleUpdateProduct = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");

      showToast(`Updated product "${data.name}"`);
      await fetchData();
    } catch (e: any) {
      alert(e.message || "Failed to update product");
    }
  };

  // Adjustments handler
  const handleApplyAdjustment = async (payload: {
    productId: string;
    locationId: string;
    countedQuantity: number;
    reason?: string;
  }) => {
    try {
      const res = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply adjustment");

      showToast(
        `Physical inventory reconciled for ${data.operation.reference} (Diff: ${
          data.difference > 0 ? "+" : ""
        }${data.difference})`
      );
      await fetchData();
      setCurrentTab("moves");
    } catch (e: any) {
      alert(e.message || "Failed to apply adjustment");
    }
  };

  // Warehouse handler: Create
  const handleCreateWarehouse = async (payload: { name: string; code: string; address?: string }) => {
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create warehouse");

      showToast(`Warehouse "${data.name}" (${data.code}) created with default zones.`);
      await fetchData();
    } catch (e: any) {
      alert(e.message || "Failed to create warehouse");
    }
  };

  // Reset Demo Data
  const handleResetData = async () => {
    if (!confirm("Reset all operations and inventory data to initial hackathon seed?")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        showToast("Database restored to initial Odoo Hackathon seed state!", "info");
        await fetchData();
      }
    } catch (e) {
      alert("Failed to reset data");
    }
  };

  // Switch role between Manager and Staff
  const handleToggleRole = () => {
    const next = currentRole === "MANAGER" ? "STAFF" : "MANAGER";
    setCurrentRole(next);
    showToast(`Active role switched to ${next}`, "info");
  };

  // Filter operations for Dashboard according to dynamic filters and header search/warehouse
  const filteredDashboardOps = operations.filter((op) => {
    let match = true;

    // Header warehouse filter
    if (selectedWarehouseId !== "ALL" && op.warehouseId !== selectedWarehouseId) {
      match = false;
    }

    // Dashboard doc type
    if (dashDocType !== "ALL" && op.type !== dashDocType) {
      match = false;
    }

    // Dashboard status
    if (dashStatus !== "ALL" && op.status !== dashStatus) {
      match = false;
    }

    // Dashboard location
    if (dashLocationId !== "ALL") {
      const matchesLoc = op.moves.some(
        (m) => m.sourceId === dashLocationId || m.destinationId === dashLocationId
      );
      if (!matchesLoc) match = false;
    }

    // Dashboard category
    if (dashCategory !== "ALL") {
      const matchesCat = op.moves.some((m) => {
        const prod = products.find((p) => p.id === m.productId);
        return prod?.category === dashCategory;
      });
      if (!matchesCat) match = false;
    }

    // Search query from header
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inRef = op.reference.toLowerCase().includes(q);
      const inPartner = op.partnerName?.toLowerCase().includes(q) ?? false;
      const inMoves = op.moves.some(
        (m) =>
          (m.productName?.toLowerCase().includes(q) ?? false) ||
          (m.productSku?.toLowerCase().includes(q) ?? false) ||
          (m.sourceName?.toLowerCase().includes(q) ?? false) ||
          (m.destinationName?.toLowerCase().includes(q) ?? false)
      );
      if (!inRef && !inPartner && !inMoves) match = false;
    }

    return match;
  });

  // Dynamic titles for header
  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Inventory Dashboard",
      subtitle: "Overview of current stock, pending operations, and performance KPIs",
    },
    products: {
      title: "Products & Stock Availability",
      subtitle: "SKU catalog, location-based quants, and automated reorder rules",
    },
    receipts: {
      title: "Receipts (Incoming Goods)",
      subtitle: "Receive supplier stock and increment warehouse ledger balances",
    },
    deliveries: {
      title: "Delivery Orders (Outgoing Goods)",
      subtitle: "Pick, pack and ship customer orders with automated stock deduction",
    },
    transfers: {
      title: "Internal Stock Transfers",
      subtitle: "Relocate stock across internal warehouse racks and production zones",
    },
    adjustments: {
      title: "Physical Inventory Adjustments",
      subtitle: "Reconcile system records with physical shelf counts and log scrap",
    },
    moves: {
      title: "Move History & Stock Ledger",
      subtitle: "Complete double-entry audit trail of all historical movements",
    },
    warehouses: {
      title: "Warehouses & Storage Zones",
      subtitle: "Manage multi-warehouse configurations and individual storage locations",
    },
    profile: {
      title: "User Profile & Security",
      subtitle: "Session credentials, role switcher, and OTP password reset verification",
    },
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-950 border-emerald-500/50 text-emerald-200"
                : "bg-purple-950 border-purple-500/50 text-purple-200"
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
        onResetData={handleResetData}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        lowStockCount={kpis?.lowStockCount || 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={tabTitles[currentTab].title}
          subtitle={tabTitles[currentTab].subtitle}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
          onSelectWarehouse={setSelectedWarehouseId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          kpis={kpis}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onNavigateToProducts={() => setCurrentTab("products")}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === "dashboard" && (
            <DashboardView
              kpis={kpis}
              operations={filteredDashboardOps}
              warehouses={warehouses}
              locations={locations}
              selectedDocType={dashDocType}
              onSelectDocType={setDashDocType}
              selectedStatus={dashStatus}
              onSelectStatus={setDashStatus}
              selectedLocationId={dashLocationId}
              onSelectLocationId={setDashLocationId}
              selectedCategory={dashCategory}
              onSelectCategory={setDashCategory}
              onValidateOperation={handleValidateOperation}
              onNavigateTab={setCurrentTab}
              onOpenNewOperation={(type) => {
                if (type === "RECEIPT") setCurrentTab("receipts");
                if (type === "DELIVERY") setCurrentTab("deliveries");
                if (type === "INTERNAL_TRANSFER") setCurrentTab("transfers");
              }}
              onOpenDemo={() => setIsDemoModalOpen(true)}
            />
          )}

          {currentTab === "products" && (
            <ProductsView
              products={products}
              locations={locations}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onOpenAdjustmentForProduct={(prod) => {
                setPreselectedAdjProduct(prod);
                setCurrentTab("adjustments");
              }}
            />
          )}

          {currentTab === "receipts" && (
            <OperationsView
              type="RECEIPT"
              operations={operations}
              products={products}
              locations={locations}
              warehouses={warehouses}
              onValidateOperation={handleValidateOperation}
              onCreateOperation={handleCreateOperation}
            />
          )}

          {currentTab === "deliveries" && (
            <OperationsView
              type="DELIVERY"
              operations={operations}
              products={products}
              locations={locations}
              warehouses={warehouses}
              onValidateOperation={handleValidateOperation}
              onCreateOperation={handleCreateOperation}
            />
          )}

          {currentTab === "transfers" && (
            <OperationsView
              type="INTERNAL_TRANSFER"
              operations={operations}
              products={products}
              locations={locations}
              warehouses={warehouses}
              onValidateOperation={handleValidateOperation}
              onCreateOperation={handleCreateOperation}
            />
          )}

          {currentTab === "adjustments" && (
            <AdjustmentsView
              products={products}
              locations={locations}
              operations={operations}
              preselectedProduct={preselectedAdjProduct}
              onApplyAdjustment={handleApplyAdjustment}
            />
          )}

          {currentTab === "moves" && <MoveHistoryView moves={moves} />}

          {currentTab === "warehouses" && (
            <WarehousesView
              warehouses={warehouses}
              locations={locations}
              products={products}
              onCreateWarehouse={handleCreateWarehouse}
            />
          )}

          {currentTab === "profile" && (
            <ProfileView currentRole={currentRole} onToggleRole={handleToggleRole} />
          )}
        </main>
      </div>

      {/* Interactive 4-Step Hackathon Demo Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        products={products}
        locations={locations}
        onRefreshData={fetchData}
        onNavigateToMoves={() => setCurrentTab("moves")}
      />
    </div>
  );
}
