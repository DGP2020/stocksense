import fs from "fs";
import path from "path";
import {
  Product,
  Warehouse,
  Location,
  StockQuant,
  Operation,
  StockMove,
  User,
  DashboardKPIs,
  FilterOptions,
  OperationType,
  OperationStatus,
} from "../types";

interface DBData {
  warehouses: Warehouse[];
  locations: Location[];
  products: Product[];
  quants: StockQuant[];
  operations: Operation[];
  moves: StockMove[];
  users: User[];
  otpStore: Record<string, { code: string; expiresAt: number; attempts?: number }>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "stocksense-db.json");

function getInitialSeedData(): DBData {
  const warehouses: Warehouse[] = [
    {
      id: "wh-1",
      name: "Main Central Warehouse",
      code: "WH1",
      address: "Building A, Industrial Area, Sector 5",
    },
    {
      id: "wh-2",
      name: "North Regional Logistics Hub",
      code: "WH2",
      address: "Warehouse Block 4, Logistics Park",
    },
  ];

  const locations: Location[] = [
    // Internal WH1 Locations
    { id: "loc-wh1-stock", name: "WH1/Stock (Main Store)", type: "INTERNAL", warehouseId: "wh-1" },
    { id: "loc-wh1-prod", name: "WH1/Production (Production Floor)", type: "INTERNAL", warehouseId: "wh-1" },
    { id: "loc-wh1-rack-a", name: "WH1/Rack A (Heavy Materials)", type: "INTERNAL", warehouseId: "wh-1" },
    { id: "loc-wh1-rack-b", name: "WH1/Rack B (Finished Goods)", type: "INTERNAL", warehouseId: "wh-1" },
    { id: "loc-wh1-out", name: "WH1/Output (Packing & Dispatch Bay)", type: "INTERNAL", warehouseId: "wh-1" },

    // Internal WH2 Locations
    { id: "loc-wh2-stock", name: "WH2/Stock (Regional Storage)", type: "INTERNAL", warehouseId: "wh-2" },

    // Partner & Virtual Locations
    { id: "loc-vendor", name: "Vendors / Inbound Delivery", type: "VENDOR", warehouseId: null },
    { id: "loc-customer", name: "Customers / Outbound Shipments", type: "CUSTOMER", warehouseId: null },
    { id: "loc-loss", name: "Virtual / Inventory Loss & Scrap", type: "INVENTORY_LOSS", warehouseId: null },
  ];

  const products: Product[] = [
    {
      id: "prod-1",
      name: "High-Grade Steel Rods 12mm",
      sku: "STL-12MM",
      category: "Raw Materials",
      uom: "kg",
      minStock: 100,
      description: "Galvanized construction steel rods for framework assembly.",
    },
    {
      id: "prod-2",
      name: "Industrial Steel Frames",
      sku: "STL-FRM-09",
      category: "Finished Goods",
      uom: "Units",
      minStock: 25,
      description: "Welded load-bearing frames ready for industrial dispatch.",
    },
    {
      id: "prod-3",
      name: "Ergonomic Office Task Chairs",
      sku: "FUR-CHR-01",
      category: "Furniture",
      uom: "Units",
      minStock: 15,
      description: "Mesh high-back executive chairs with lumbar support.",
    },
    {
      id: "prod-4",
      name: "ESP32-S3 Microcontroller Boards",
      sku: "ELE-ESP-32",
      category: "Electronics",
      uom: "Units",
      minStock: 50,
      description: "Dual-core Wi-Fi/BLE IoT processing microcontrollers.",
    },
    {
      id: "prod-5",
      name: "Hex Socket Head Cap Screws M8",
      sku: "FST-BLT-08",
      category: "Fasteners",
      uom: "Boxes",
      minStock: 40,
      description: "Grade 8.8 high-tensile steel fasteners (100 pcs/box).",
    },
  ];

  const quants: StockQuant[] = [
    // Steel Rods: 150 kg in WH1/Stock, 30 kg in WH1/Production
    { id: "q-1", productId: "prod-1", locationId: "loc-wh1-stock", quantity: 150 },
    { id: "q-2", productId: "prod-1", locationId: "loc-wh1-prod", quantity: 30 },

    // Steel Frames: 12 Units in WH1/Rack B (Low Stock alert: 12 < 25)
    { id: "q-3", productId: "prod-2", locationId: "loc-wh1-rack-b", quantity: 12 },

    // Chairs: 24 Units in WH1/Stock
    { id: "q-4", productId: "prod-3", locationId: "loc-wh1-stock", quantity: 24 },

    // ESP32: 0 Units in WH1/Stock (Out of Stock alert: 0)
    { id: "q-5", productId: "prod-4", locationId: "loc-wh1-stock", quantity: 0 },

    // Fasteners: 65 Boxes in WH1/Rack A
    { id: "q-6", productId: "prod-5", locationId: "loc-wh1-rack-a", quantity: 65 },
  ];

  const operations: Operation[] = [
    {
      id: "op-1",
      type: "RECEIPT",
      status: "WAITING",
      reference: "WH1/IN/0001",
      partnerName: "Apex Steel Mills Ltd.",
      warehouseId: "wh-1",
      destinationLocationId: "loc-wh1-stock",
      notes: "Scheduled vendor bulk delivery of raw steel inventory.",
      createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      moves: [
        {
          id: "m-1",
          operationId: "op-1",
          productId: "prod-1",
          sourceId: "loc-vendor",
          destinationId: "loc-wh1-stock",
          quantity: 100,
          createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        },
      ],
    },
    {
      id: "op-2",
      type: "DELIVERY",
      status: "READY",
      reference: "WH1/OUT/0001",
      partnerName: "Metro Corporate Offices",
      warehouseId: "wh-1",
      sourceLocationId: "loc-wh1-stock",
      notes: "Pick & Pack complete. Ready for customer freight pickup.",
      createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      moves: [
        {
          id: "m-2",
          operationId: "op-2",
          productId: "prod-3",
          sourceId: "loc-wh1-stock",
          destinationId: "loc-customer",
          quantity: 10,
          createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
        },
      ],
    },
    {
      id: "op-3",
      type: "INTERNAL_TRANSFER",
      status: "WAITING",
      reference: "WH1/INT/0001",
      warehouseId: "wh-1",
      sourceLocationId: "loc-wh1-stock",
      destinationLocationId: "loc-wh1-prod",
      notes: "Replenish assembly floor from main raw store.",
      createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      moves: [
        {
          id: "m-3",
          operationId: "op-3",
          productId: "prod-1",
          sourceId: "loc-wh1-stock",
          destinationId: "loc-wh1-prod",
          quantity: 50,
          createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
        },
      ],
    },
    {
      id: "op-4",
      type: "RECEIPT",
      status: "DONE",
      reference: "WH1/IN/0000",
      partnerName: "Apex Steel Mills Ltd.",
      warehouseId: "wh-1",
      destinationLocationId: "loc-wh1-stock",
      notes: "Initial inventory setup receipt.",
      createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
      moves: [
        {
          id: "m-4",
          operationId: "op-4",
          productId: "prod-1",
          sourceId: "loc-vendor",
          destinationId: "loc-wh1-stock",
          quantity: 150,
          createdAt: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
        },
      ],
    },
  ];

  const moves: StockMove[] = [
    {
      id: "m-4",
      operationId: "op-4",
      productId: "prod-1",
      sourceId: "loc-vendor",
      destinationId: "loc-wh1-stock",
      quantity: 150,
      createdAt: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
      reference: "WH1/IN/0000",
      type: "RECEIPT",
    },
  ];

  const users: User[] = [
    {
      id: "usr-1",
      name: "Sarah Jenkins",
      email: "manager@stocksense.io",
      role: "MANAGER",
      createdAt: new Date(Date.now() - 3600 * 1000 * 200).toISOString(),
    },
    {
      id: "usr-2",
      name: "Marcus Vance",
      email: "staff@stocksense.io",
      role: "STAFF",
      createdAt: new Date(Date.now() - 3600 * 1000 * 150).toISOString(),
    },
  ];

  return {
    warehouses,
    locations,
    products,
    quants,
    operations,
    moves,
    users,
    otpStore: {},
  };
}

class StorageEngine {
  private data: DBData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DBData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to load database file, resetting to initial seed:", e);
    }
    const seed = getInitialSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(dataToSave: DBData = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = path.join(DATA_DIR, `stocksense-db.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`);
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), "utf-8");
      try {
        fs.renameSync(tmpFile, DB_FILE);
      } catch {
        fs.copyFileSync(tmpFile, DB_FILE);
        try { fs.unlinkSync(tmpFile); } catch {}
      }
    } catch (e) {
      console.error("Error writing to database file:", e);
    }
  }

  public resetData(): DBData {
    this.data = getInitialSeedData();
    this.saveData();
    return this.data;
  }

  // --- Products ---
  public getProducts(searchQuery?: string, category?: string): Product[] {
    const enriched = this.data.products.map((p) => {
      const quants = this.data.quants.filter((q) => q.productId === p.id);
      const totalStock = quants.reduce((acc, q) => {
        const loc = this.data.locations.find((l) => l.id === q.locationId);
        // Only count internal locations towards available on-hand stock
        return loc && loc.type === "INTERNAL" ? acc + q.quantity : acc;
      }, 0);

      const quantBreakdown = quants.map((q) => {
        const loc = this.data.locations.find((l) => l.id === q.locationId);
        const wh = loc?.warehouseId ? this.data.warehouses.find((w) => w.id === loc.warehouseId) : undefined;
        return {
          locationId: q.locationId,
          locationName: loc?.name || "Unknown Location",
          warehouseName: wh?.name || "Unassigned",
          quantity: q.quantity,
        };
      });

      return {
        ...p,
        totalStock,
        quants: quantBreakdown,
      };
    });

    return enriched.filter((p) => {
      let matches = true;
      if (category && category !== "ALL" && p.category !== category) {
        matches = false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        matches = matches && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      return matches;
    });
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  public createProduct(data: {
    name: string;
    sku: string;
    category: string;
    uom: string;
    minStock: number;
    description?: string;
    initialStock?: number;
    initialLocationId?: string;
  }): Product {
    const existing = this.data.products.find((p) => p.sku.toLowerCase() === data.sku.toLowerCase());
    if (existing) {
      throw new Error(`Product with SKU "${data.sku}" already exists.`);
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      sku: data.sku.toUpperCase(),
      category: data.category,
      uom: data.uom,
      minStock: Number(data.minStock) || 0,
      description: data.description || "",
    };

    this.data.products.push(newProduct);

    if (data.initialStock && data.initialStock > 0 && data.initialLocationId) {
      this.updateQuant(newProduct.id, data.initialLocationId, data.initialStock);

      // Record initial inventory move
      const moveId = `m-${Date.now()}`;
      this.data.moves.unshift({
        id: moveId,
        operationId: `init-${newProduct.id}`,
        productId: newProduct.id,
        sourceId: "loc-vendor",
        destinationId: data.initialLocationId,
        quantity: data.initialStock,
        createdAt: new Date().toISOString(),
        reference: `INIT/${newProduct.sku}`,
        type: "RECEIPT",
      });
    }

    this.saveData();
    return this.getProductById(newProduct.id)!;
  }

  public updateProduct(
    id: string,
    updates: Partial<Pick<Product, "name" | "sku" | "category" | "uom" | "minStock" | "description">>
  ): Product {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");

    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      sku: updates.sku ? updates.sku.toUpperCase() : this.data.products[idx].sku,
    };

    this.saveData();
    return this.getProductById(id)!;
  }

  // --- Quants & Locations ---
  public getQuants(productId?: string, locationId?: string): StockQuant[] {
    return this.data.quants.filter((q) => {
      let match = true;
      if (productId) match = match && q.productId === productId;
      if (locationId) match = match && q.locationId === locationId;
      return match;
    });
  }

  public updateQuant(productId: string, locationId: string, deltaQuantity: number): StockQuant {
    let quant = this.data.quants.find((q) => q.productId === productId && q.locationId === locationId);
    if (!quant) {
      quant = {
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId,
        locationId,
        quantity: 0,
      };
      this.data.quants.push(quant);
    }
    quant.quantity = Math.max(0, quant.quantity + deltaQuantity);
    this.saveData();
    return quant;
  }

  public setQuantExact(productId: string, locationId: string, exactQuantity: number): StockQuant {
    let quant = this.data.quants.find((q) => q.productId === productId && q.locationId === locationId);
    if (!quant) {
      quant = {
        id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId,
        locationId,
        quantity: 0,
      };
      this.data.quants.push(quant);
    }
    quant.quantity = Math.max(0, exactQuantity);
    this.saveData();
    return quant;
  }

  public getWarehouses(): Warehouse[] {
    return this.data.warehouses;
  }

  public createWarehouse(data: { name: string; code: string; address?: string }): Warehouse {
    const newWh: Warehouse = {
      id: `wh-${Date.now()}`,
      name: data.name,
      code: data.code.toUpperCase(),
      address: data.address,
    };
    this.data.warehouses.push(newWh);

    // Automatically create default Internal Locations for this warehouse
    const defaultStockLoc: Location = {
      id: `loc-${newWh.code.toLowerCase()}-stock`,
      name: `${newWh.code}/Stock (Main Floor)`,
      type: "INTERNAL",
      warehouseId: newWh.id,
    };
    const defaultProdLoc: Location = {
      id: `loc-${newWh.code.toLowerCase()}-prod`,
      name: `${newWh.code}/Production Floor`,
      type: "INTERNAL",
      warehouseId: newWh.id,
    };
    this.data.locations.push(defaultStockLoc, defaultProdLoc);

    this.saveData();
    return newWh;
  }

  public getLocations(warehouseId?: string): Location[] {
    return this.data.locations
      .filter((l) => !warehouseId || l.warehouseId === warehouseId || l.type !== "INTERNAL")
      .map((l) => ({
        ...l,
        warehouse: l.warehouseId ? this.data.warehouses.find((w) => w.id === l.warehouseId) : undefined,
      }));
  }

  // --- Operations & Ledger Movements ---
  public getOperations(filters?: FilterOptions): Operation[] {
    let ops = [...this.data.operations];

    // Enrich moves with names
    ops = ops.map((op) => ({
      ...op,
      moves: op.moves.map((m) => {
        const prod = this.data.products.find((p) => p.id === m.productId);
        const src = this.data.locations.find((l) => l.id === m.sourceId);
        const dst = this.data.locations.find((l) => l.id === m.destinationId);
        return {
          ...m,
          productName: prod?.name || "Unknown Product",
          productSku: prod?.sku || "N/A",
          sourceName: src?.name || "Unknown Source",
          destinationName: dst?.name || "Unknown Destination",
        };
      }),
    }));

    if (filters) {
      if (filters.documentType && filters.documentType !== "ALL") {
        ops = ops.filter((o) => o.type === filters.documentType);
      }
      if (filters.status && filters.status !== "ALL") {
        ops = ops.filter((o) => o.status === filters.status);
      }
      if (filters.warehouseId) {
        ops = ops.filter((o) => o.warehouseId === filters.warehouseId);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        ops = ops.filter(
          (o) =>
            o.reference.toLowerCase().includes(q) ||
            Boolean(o.partnerName && o.partnerName.toLowerCase().includes(q)) ||
            o.moves.some(
              (m) =>
                (m.productName?.toLowerCase().includes(q) ?? false) ||
                (m.productSku?.toLowerCase().includes(q) ?? false)
            )
        );
      }
    }

    // Sort newest first
    return ops.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOperationById(id: string): Operation | undefined {
    return this.getOperations().find((o) => o.id === id);
  }

  public createOperation(data: {
    type: OperationType;
    partnerName?: string;
    warehouseId?: string;
    sourceLocationId?: string;
    destinationLocationId?: string;
    notes?: string;
    items: { productId: string; quantity: number; sourceId?: string; destinationId?: string }[];
  }): Operation {
    const wh = data.warehouseId ? this.data.warehouses.find((w) => w.id === data.warehouseId) : this.data.warehouses[0];
    const prefix = wh?.code || "WH1";

    let typeCode = "INT";
    if (data.type === "RECEIPT") typeCode = "IN";
    if (data.type === "DELIVERY") typeCode = "OUT";
    if (data.type === "ADJUSTMENT") typeCode = "ADJ";

    const count = this.data.operations.filter((o) => o.type === data.type).length + 1;
    const reference = `${prefix}/${typeCode}/${String(count).padStart(4, "0")}`;

    const opId = `op-${Date.now()}`;
    const moves: StockMove[] = data.items.map((item, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      operationId: opId,
      productId: item.productId,
      sourceId: item.sourceId || data.sourceLocationId || "loc-vendor",
      destinationId: item.destinationId || data.destinationLocationId || "loc-customer",
      quantity: Number(item.quantity),
      createdAt: new Date().toISOString(),
      reference,
      type: data.type,
    }));

    const newOp: Operation = {
      id: opId,
      type: data.type,
      status: "READY",
      reference,
      partnerName: data.partnerName,
      warehouseId: wh?.id,
      sourceLocationId: data.sourceLocationId,
      destinationLocationId: data.destinationLocationId,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moves,
    };

    this.data.operations.unshift(newOp);
    this.saveData();
    return this.getOperationById(newOp.id)!;
  }

  public updateOperationStatus(id: string, status: OperationStatus): Operation {
    const op = this.data.operations.find((o) => o.id === id);
    if (!op) throw new Error("Operation not found");
    op.status = status;
    op.updatedAt = new Date().toISOString();
    this.saveData();
    return this.getOperationById(id)!;
  }

  // ATOMIC VALIDATION: Ledger increment/decrement
  public validateOperation(id: string): { operation: Operation; movesApplied: number } {
    const op = this.data.operations.find((o) => o.id === id);
    if (!op) throw new Error("Operation not found");
    if (op.status === "DONE") throw new Error("Operation is already marked as DONE");
    if (op.status === "CANCELED") throw new Error("Cannot validate a canceled operation");

    // Process ledger shifts per operation type
    for (const move of op.moves) {
      if (op.type === "RECEIPT") {
        // Vendor delivery: destination stock INCREASES
        this.updateQuant(move.productId, move.destinationId, move.quantity);
      } else if (op.type === "DELIVERY") {
        // Outbound shipment: source stock DECREASES
        this.updateQuant(move.productId, move.sourceId, -move.quantity);
      } else if (op.type === "INTERNAL_TRANSFER") {
        // Relocation: source stock DECREASES, destination stock INCREASES
        this.updateQuant(move.productId, move.sourceId, -move.quantity);
        this.updateQuant(move.productId, move.destinationId, move.quantity);
      } else if (op.type === "ADJUSTMENT") {
        // Physical inventory count reconciliation
        this.setQuantExact(move.productId, move.destinationId, move.quantity);
      }

      // Add to immutable stock moves audit ledger
      this.data.moves.unshift({
        ...move,
        reference: op.reference,
        type: op.type,
        createdAt: new Date().toISOString(),
      });
    }

    op.status = "DONE";
    op.updatedAt = new Date().toISOString();
    this.saveData();

    return {
      operation: this.getOperationById(id)!,
      movesApplied: op.moves.length,
    };
  }

  // Stock Adjustment (Physical Count Reconciliation)
  public createInventoryAdjustment(data: {
    productId: string;
    locationId: string;
    countedQuantity: number;
    reason?: string;
  }): { operation: Operation; difference: number } {
    const prod = this.data.products.find((p) => p.id === data.productId);
    const loc = this.data.locations.find((l) => l.id === data.locationId);
    if (!prod || !loc) throw new Error("Invalid product or location");

    const existingQuant = this.data.quants.find((q) => q.productId === data.productId && q.locationId === data.locationId);
    const recordedQty = existingQuant ? existingQuant.quantity : 0;
    const difference = data.countedQuantity - recordedQty;

    const wh = loc.warehouseId ? this.data.warehouses.find((w) => w.id === loc.warehouseId) : this.data.warehouses[0];
    const prefix = wh?.code || "WH1";
    const count = this.data.operations.filter((o) => o.type === "ADJUSTMENT").length + 1;
    const reference = `${prefix}/ADJ/${String(count).padStart(4, "0")}`;

    const opId = `op-adj-${Date.now()}`;
    const move: StockMove = {
      id: `m-adj-${Date.now()}`,
      operationId: opId,
      productId: data.productId,
      sourceId: difference < 0 ? data.locationId : "loc-loss",
      destinationId: difference < 0 ? "loc-loss" : data.locationId,
      quantity: Math.abs(difference),
      createdAt: new Date().toISOString(),
      reference,
      type: "ADJUSTMENT",
    };

    // Update quant exact
    this.setQuantExact(data.productId, data.locationId, data.countedQuantity);

    const newOp: Operation = {
      id: opId,
      type: "ADJUSTMENT",
      status: "DONE",
      reference,
      partnerName: "Inventory Audit Team",
      warehouseId: loc.warehouseId || undefined,
      notes: data.reason || `Physical Count Reconciliation (Diff: ${difference > 0 ? "+" : ""}${difference} ${prod.uom})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moves: [move],
    };

    this.data.operations.unshift(newOp);
    this.data.moves.unshift(move);
    this.saveData();

    return {
      operation: this.getOperationById(newOp.id)!,
      difference,
    };
  }

  // --- Move History Audit Trail ---
  public getMoves(productId?: string, locationId?: string): StockMove[] {
    return this.data.moves
      .filter((m) => {
        let match = true;
        if (productId) match = match && m.productId === productId;
        if (locationId) match = match && (m.sourceId === locationId || m.destinationId === locationId);
        return match;
      })
      .map((m) => {
        const prod = this.data.products.find((p) => p.id === m.productId);
        const src = this.data.locations.find((l) => l.id === m.sourceId);
        const dst = this.data.locations.find((l) => l.id === m.destinationId);
        return {
          ...m,
          productName: prod?.name || "Product",
          productSku: prod?.sku || "SKU",
          sourceName: src?.name || "Source",
          destinationName: dst?.name || "Destination",
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Dashboard KPIs ---
  public getKPIs(): DashboardKPIs {
    const products = this.getProducts();
    const totalProductsCount = products.length;
    const totalQuantityInStock = products.reduce((acc, p) => acc + (p.totalStock || 0), 0);

    const lowStockItems = products
      .filter((p) => (p.totalStock || 0) <= p.minStock)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        totalStock: p.totalStock || 0,
        minStock: p.minStock,
        uom: p.uom,
      }));

    const outOfStockCount = products.filter((p) => (p.totalStock || 0) <= 0).length;
    const lowStockCount = lowStockItems.length;

    const pendingReceiptsCount = this.data.operations.filter(
      (o) => o.type === "RECEIPT" && (o.status === "WAITING" || o.status === "READY" || o.status === "DRAFT")
    ).length;

    const pendingDeliveriesCount = this.data.operations.filter(
      (o) => o.type === "DELIVERY" && (o.status === "WAITING" || o.status === "READY" || o.status === "DRAFT")
    ).length;

    const scheduledTransfersCount = this.data.operations.filter(
      (o) => o.type === "INTERNAL_TRANSFER" && (o.status === "WAITING" || o.status === "READY" || o.status === "DRAFT")
    ).length;

    return {
      totalProductsCount,
      totalQuantityInStock,
      lowStockCount,
      outOfStockCount,
      pendingReceiptsCount,
      pendingDeliveriesCount,
      scheduledTransfersCount,
      lowStockItems,
    };
  }

  // --- Users & OTP Reset ---
  public getUsers(): User[] {
    return this.data.users.map(({ password: _, ...rest }) => rest as User);
  }

  public generateOTP(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.data.otpStore[email.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    };
    this.saveData();
    return code;
  }

  public verifyOTPAndResetPassword(email: string, code: string, newPassword?: string): boolean {
    const normalized = email.toLowerCase();
    const entry = this.data.otpStore[normalized];
    if (!entry) return false;

    // Check expiry
    if (Date.now() > entry.expiresAt) {
      delete this.data.otpStore[normalized];
      this.saveData();
      return false;
    }

    // Increment and check attempts (limit to max 5 failed attempts)
    entry.attempts = (entry.attempts || 0) + 1;
    if (entry.attempts > 5) {
      delete this.data.otpStore[normalized];
      this.saveData();
      return false;
    }

    if (entry.code !== code) {
      this.saveData();
      return false;
    }

    // Reset successful: immediately consume OTP to prevent replay attacks
    delete this.data.otpStore[normalized];
    this.saveData();
    return true;
  }
}

// Global Singleton
declare global {
  // eslint-disable-next-line no-var
  var __stocksense_storage__: StorageEngine | undefined;
}

export const db = global.__stocksense_storage__ || new StorageEngine();
if (process.env.NODE_ENV !== "production") {
  global.__stocksense_storage__ = db;
}
