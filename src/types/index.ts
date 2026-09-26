export type Role = "MANAGER" | "STAFF";

export type OperationType = "RECEIPT" | "DELIVERY" | "INTERNAL_TRANSFER" | "ADJUSTMENT";

export type OperationStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELED";

export type LocationType = "VENDOR" | "CUSTOMER" | "INTERNAL" | "INVENTORY_LOSS";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  warehouseId?: string | null;
  warehouse?: Warehouse;
}

export interface StockQuant {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: string; // kg, Units, Boxes, Liters, etc.
  minStock: number;
  description?: string;
  totalStock?: number;
  quants?: {
    locationId: string;
    locationName: string;
    warehouseName?: string;
    quantity: number;
  }[];
}

export interface MoveItem {
  id?: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  sourceId: string;
  destinationId: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  reference: string;
  partnerName?: string; // Vendor name for Receipts, Customer name for Delivery
  warehouseId?: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  moves: StockMove[];
}

export interface StockMove {
  id: string;
  operationId: string;
  productId: string;
  productName?: string;
  productSku?: string;
  sourceId: string;
  sourceName?: string;
  destinationId: string;
  destinationName?: string;
  quantity: number;
  createdAt: string;
  reference?: string;
  type?: OperationType;
}

export interface DashboardKPIs {
  totalProductsCount: number;
  totalQuantityInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  scheduledTransfersCount: number;
  lowStockItems: {
    id: string;
    name: string;
    sku: string;
    totalStock: number;
    minStock: number;
    uom: string;
  }[];
}

export interface FilterOptions {
  documentType?: OperationType | "ALL";
  status?: OperationStatus | "ALL";
  warehouseId?: string;
  locationId?: string;
  category?: string;
  searchQuery?: string;
}
