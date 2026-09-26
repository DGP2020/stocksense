<div align="center">
  <h1>📦 StockSense</h1>
  <p><strong>A Modular, Ledger-Backed Inventory Management System (IMS)</strong></p>
  <p><em>Built for the Odoo Hackathon</em></p>

  ![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

<br />

**StockSense** digitizes and streamlines stock operations, replacing manual registers and spreadsheets with a centralized, real-time platform. At its core, it features a robust, ledger-backed movement system ensuring complete auditability and precision for all inventory workflows.

## 🎯 Target Users

- **🧑‍💼 Inventory Managers:** Manage incoming and outgoing stock, establish reorder rules, and configure warehouse layouts.
- **👷 Warehouse Staff:** Execute internal transfers, handle item picking, packing, shelving, and conduct physical inventory counts.

---

## ⚡ 8-Hour Hackathon Tech Stack & Architecture

To complete all requirements within a strict 8-hour sprint, we utilized a unified full-stack architecture. This approach eliminates API glue code and context switching, enabling rapid iteration:

- **Framework:** **Next.js (App Router, TypeScript)** — Server Actions handle form submissions and mutations directly without manual API endpoint setup.
- **Database & ORM:** **PostgreSQL (Neon / Supabase) + Prisma ORM** — Instant migrations and atomic transaction support (`prisma.$transaction`) to maintain ledger integrity.
- **UI Components:** **Tailwind CSS + shadcn/ui** — Copy-paste accessible tables, modals, status badges, and KPI stat cards.
- **Authentication:** **NextAuth.js (Auth.js) / Supabase Auth** — Pre-configured secure sessions and password recovery.
- **Icons & Notifications:** **Lucide React + Sonner** — Crisp iconography and real-time toast notifications for operation validation and stock alerts.

---

## ✨ Key Features

### 🔐 Authentication & Profiles
- Sign up and sign in flows with session control.
- OTP-based password reset support.
- Role-based user profile management (Manager vs. Staff).

### 📊 KPI Dashboard
- **Real-time Metrics:** Total Products in Stock.
- **Automated Alerts:** Low Stock / Out of Stock Items.
- **Action Items:** Pending Receipts, Pending Deliveries, and Scheduled Internal Transfers.

### 🔍 Dynamic Filtering System
- **By Document Type:** Receipts, Delivery Orders, Internal Transfers, Adjustments.
- **By Status:** Draft, Waiting, Ready, Done, Canceled.
- **By Location:** Filter by specific Warehouses or Internal Locations.
- **By Product:** Group and search by Product Category.

### 📦 Product Management
- Create and update items with detailed metadata (Name, SKU/Code, Category, Unit of Measure, Initial Stock).
- View stock availability breakdown per warehouse and location.
- Set automated reordering rules and minimum stock thresholds.

### 🔄 Core Inventory Operations
- **📥 Receipts (Incoming):** Log vendor deliveries; validating automatically increases stock on hand.
- **📤 Delivery Orders (Outgoing):** Pick and pack workflow; validating automatically decrements stock upon dispatch.
- **🔁 Internal Transfers:** Relocate stock across internal locations (e.g., Main Store to Production Rack) with full ledger tracking.
- **⚖️ Inventory Adjustments:** Resolve discrepancies between physical counts and system balances with auto-generated adjustment records.
- **📜 Move History:** A complete, immutable audit trail showing all historical product movements across locations.

---

## 🗄️ Database Schema Blueprint

The application relies on a highly relational, ledger-based database architecture to ensure every stock movement is tracked via double-entry inventory principles.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  MANAGER
  STAFF
}

enum OperationType {
  RECEIPT
  DELIVERY
  INTERNAL_TRANSFER
  ADJUSTMENT
}

enum OperationStatus {
  DRAFT
  WAITING
  READY
  DONE
  CANCELED
}

enum LocationType {
  VENDOR
  CUSTOMER
  INTERNAL
  INVENTORY_LOSS
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
}

model Warehouse {
  id        String     @id @default(uuid())
  name      String
  code      String     @unique
  locations Location[]
}

model Location {
  id           String        @id @default(uuid())
  name         String
  type         LocationType  @default(INTERNAL)
  warehouseId  String?
  warehouse    Warehouse?    @relation(fields: [warehouseId], references: [id])
  quants       StockQuant[]
  movesFrom    StockMove[]   @relation("SourceLocation")
  movesTo      StockMove[]   @relation("DestinationLocation")
}

model Product {
  id          String       @id @default(uuid())
  name        String
  sku         String       @unique
  category    String
  uom         String       // Unit of Measure (kg, units, etc.)
  minStock    Int          @default(10)
  quants      StockQuant[]
  stockMoves  StockMove[]
}

model StockQuant {
  id         String   @id @default(uuid())
  productId  String
  locationId String
  quantity   Float    @default(0)
  product    Product  @relation(fields: [productId], references: [id])
  location   Location @relation(fields: [locationId], references: [id])
  
  @@unique([productId, locationId])
}

model Operation {
  id          String          @id @default(uuid())
  type        OperationType
  status      OperationStatus @default(DRAFT)
  reference   String          @unique
  partnerName String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  moves       StockMove[]
}

model StockMove {
  id            String    @id @default(uuid())
  operationId   String
  productId     String
  sourceId      String
  destinationId String
  quantity      Float
  createdAt     DateTime  @default(now())
  
  operation     Operation @relation(fields: [operationId], references: [id])
  product       Product   @relation(fields: [productId], references: [id])
  source        Location  @relation("SourceLocation", fields: [sourceId], references: [id])
  destination   Location  @relation("DestinationLocation", fields: [destinationId], references: [id])
}
