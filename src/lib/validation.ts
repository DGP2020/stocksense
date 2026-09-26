/**
 * StockSense Security Validation & Sanitization Module
 * Compliance Standards:
 * - NIST SP 800-53 Rev. 5: SI-10 (Information Input Validation)
 * - ISO/IEC 27001:2022: Control A.8.28 (Secure Coding)
 * - OWASP Top 10 (2021): A03:2021 - Injection
 */

/**
 * Sanitizes strings by stripping potentially harmful HTML/script tags and trim.
 */
export function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== "string") return "";
  // Strip control characters, html tags, and normalize
  const cleaned = val
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Validates email format strictly.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email.length <= 120 && emailRegex.test(email.trim());
}

/**
 * Validates 6-digit numeric OTP code.
 */
export function isValidOTPCode(code: unknown): boolean {
  if (typeof code !== "string" && typeof code !== "number") return false;
  const str = String(code).trim();
  return /^\d{6}$/.test(str);
}

/**
 * Defends against prototype pollution by sanitizing keys in objects.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const safeObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue; // Block prototype pollution vectors
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      safeObj[key] = sanitizeObject(value);
    } else {
      safeObj[key] = value;
    }
  }
  return safeObj;
}

/**
 * Product validation schema.
 */
export interface ValidatedProductInput {
  name: string;
  sku: string;
  category: string;
  uom: string;
  minStock: number;
  description: string;
}

export function validateProductInput(body: any): { valid: boolean; data?: ValidatedProductInput; error?: string } {
  const safe = sanitizeObject(body || {});
  const name = sanitizeString(safe.name, 100);
  const sku = sanitizeString(safe.sku, 30).toUpperCase();
  const category = sanitizeString(safe.category, 60);
  const uom = sanitizeString(safe.uom, 20);
  const description = sanitizeString(safe.description, 500);

  if (!name || name.length < 2) {
    return { valid: false, error: "Product name is required and must be at least 2 characters." };
  }
  if (!sku || sku.length < 2) {
    return { valid: false, error: "Product SKU is required and must be at least 2 characters." };
  }
  if (!/^[A-Z0-9\-_.]+$/.test(sku)) {
    return { valid: false, error: "Product SKU must contain only uppercase letters, numbers, hyphens, and dots." };
  }
  if (!category) {
    return { valid: false, error: "Product category is required." };
  }
  if (!uom) {
    return { valid: false, error: "Unit of Measure (UoM) is required." };
  }

  const minStock = Number(safe.minStock);
  if (isNaN(minStock) || minStock < 0 || !Number.isFinite(minStock)) {
    return { valid: false, error: "Minimum stock threshold must be a non-negative number." };
  }

  return {
    valid: true,
    data: {
      name,
      sku,
      category,
      uom,
      minStock: Math.round(minStock),
      description,
    },
  };
}

/**
 * Operation validation schema.
 */
export interface ValidatedOperationInput {
  type: "RECEIPT" | "DELIVERY" | "INTERNAL_TRANSFER" | "ADJUSTMENT";
  warehouseId?: string;
  sourceLocationId: string;
  destinationLocationId: string;
  items: Array<{ productId: string; quantity: number }>;
  notes?: string;
}

export function validateOperationInput(body: any): { valid: boolean; data?: ValidatedOperationInput; error?: string } {
  const safe = sanitizeObject(body || {});
  const validTypes = ["RECEIPT", "DELIVERY", "INTERNAL_TRANSFER", "ADJUSTMENT"];
  if (!validTypes.includes(safe.type)) {
    return { valid: false, error: `Invalid operation type. Allowed: ${validTypes.join(", ")}` };
  }

  const sourceLocationId = sanitizeString(safe.sourceLocationId, 80);
  const destinationLocationId = sanitizeString(safe.destinationLocationId, 80);

  if (!sourceLocationId) {
    return { valid: false, error: "Source location is required." };
  }
  if (!destinationLocationId) {
    return { valid: false, error: "Destination location is required." };
  }
  if (sourceLocationId === destinationLocationId) {
    return { valid: false, error: "Source and destination locations cannot be identical." };
  }

  if (!Array.isArray(safe.items) || safe.items.length === 0) {
    return { valid: false, error: "Operation must include at least one item." };
  }

  const validatedItems: Array<{ productId: string; quantity: number }> = [];
  for (let i = 0; i < safe.items.length; i++) {
    const item = safe.items[i];
    const productId = sanitizeString(item?.productId, 80);
    const quantity = Number(item?.quantity);

    if (!productId) {
      return { valid: false, error: `Item #${i + 1} is missing a valid product ID.` };
    }
    if (isNaN(quantity) || quantity <= 0 || !Number.isFinite(quantity)) {
      return { valid: false, error: `Item #${i + 1} must have a strictly positive quantity (> 0).` };
    }
    validatedItems.push({ productId, quantity: Math.round(quantity) });
  }

  return {
    valid: true,
    data: {
      type: safe.type,
      warehouseId: safe.warehouseId ? sanitizeString(safe.warehouseId, 80) : undefined,
      sourceLocationId,
      destinationLocationId,
      items: validatedItems,
      notes: safe.notes ? sanitizeString(safe.notes, 500) : undefined,
    },
  };
}

/**
 * Inventory Adjustment validation schema.
 */
export interface ValidatedAdjustmentInput {
  productId: string;
  locationId: string;
  countedQuantity: number;
  reason?: string;
}

export function validateAdjustmentInput(body: any): { valid: boolean; data?: ValidatedAdjustmentInput; error?: string } {
  const safe = sanitizeObject(body || {});
  const productId = sanitizeString(safe.productId, 80);
  const locationId = sanitizeString(safe.locationId, 80);
  const countedQuantity = Number(safe.countedQuantity);
  const reason = sanitizeString(safe.reason || "Physical Cycle Count Audit", 255);

  if (!productId) {
    return { valid: false, error: "Product ID is required for inventory adjustment." };
  }
  if (!locationId) {
    return { valid: false, error: "Location ID is required for inventory adjustment." };
  }
  if (isNaN(countedQuantity) || countedQuantity < 0 || !Number.isFinite(countedQuantity)) {
    return { valid: false, error: "Counted physical quantity must be a non-negative number (>= 0)." };
  }

  return {
    valid: true,
    data: {
      productId,
      locationId,
      countedQuantity: Math.round(countedQuantity),
      reason,
    },
  };
}

/**
 * Warehouse validation schema.
 */
export function validateWarehouseInput(body: any): {
  valid: boolean;
  data?: { name: string; code: string; address?: string };
  error?: string;
} {
  const safe = sanitizeObject(body || {});
  const name = sanitizeString(safe.name, 100);
  const code = sanitizeString(safe.code, 15).toUpperCase();
  const address = safe.address ? sanitizeString(safe.address, 255) : undefined;

  if (!name || name.length < 2) {
    return { valid: false, error: "Warehouse name is required (minimum 2 characters)." };
  }
  if (!code || code.length < 2) {
    return { valid: false, error: "Warehouse code is required (e.g. WH3)." };
  }
  if (!/^[A-Z0-9_\-]+$/.test(code)) {
    return { valid: false, error: "Warehouse code must contain only alphanumeric characters." };
  }

  return {
    valid: true,
    data: { name, code, address },
  };
}
