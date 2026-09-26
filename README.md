# 📦 StockSense — Modular Inventory Management System (IMS)

StockSense is a modular Inventory Management System (IMS) built for the **Odoo Hackathon**. It digitizes and streamlines stock operations, replacing manual registers and spreadsheets with a centralized, real-time platform featuring a ledger-backed movement system.

---

##  8-Hour Hackathon Tech Stack & Architecture

To complete all requirements within an 8-hour sprint, a unified full-stack architecture eliminates API glue code and context switching:

* **Framework**: **Next.js (App Router, TypeScript)** — Server Actions handle form submissions and mutations directly without manual API endpoint setup.
* **Database & ORM**: **PostgreSQL (Neon / Supabase)** with **Prisma ORM** — Instant migrations and atomic transaction support (`prisma.$transaction`) for ledger integrity.
* **UI Components**: **Tailwind CSS** + **shadcn/ui** — Copy-paste accessible tables, modals, status badges, and KPI stat cards.
* **Authentication**: **NextAuth.js (Auth.js)** or **Supabase Auth** — Pre-configured sessions and password recovery.
* **Icons & Notifications**: **Lucide React** + **Sonner** (toast notifications for operation validation and stock alerts).

---

##  Target Users

* **Inventory Managers**: Manage incoming and outgoing stock, reorder rules, and warehouse configurations.
* **Warehouse Staff**: Execute internal transfers, item picking, packing, shelving, and physical counting.

---

##  Key Features

* **Authentication & Profiles**:
  * Sign up and sign in flows.
  * OTP-based password reset support[cite: 1].
  * User profile management and session control[cite: 1].

* **KPI Dashboard**:
  * **Total Products in Stock**[cite: 1].
  * **Low Stock / Out of Stock Items** with automated alerts[cite: 1].
  * **Pending Receipts** & **Pending Deliveries**[cite: 1].
  * **Scheduled Internal Transfers**[cite: 1].

* **Dynamic Filtering System**:
  * **By Document Type**: Receipts, Delivery Orders, Internal Transfers, Adjustments[cite: 1].
  * **By Status**: `Draft`, `Waiting`, `Ready`, `Done`, `Canceled`[cite: 1].
  * **By Warehouse / Location**[cite: 1].
  * **By Product Category**[cite: 1].

* **Product Management**:
  * Create and update items with Product Name, SKU / Code, Category, Unit of Measure, and Initial Stock[cite: 1].
  * Stock availability breakdown per warehouse and location[cite: 1].
  * Reordering rules and thresholds[cite: 1].

* **Core Inventory Operations**:
  * **Receipts (Incoming Stock)**: Log vendor deliveries; validating automatically increases stock on hand[cite: 1].
  * **Delivery Orders (Outgoing Stock)**: Pick and pack workflow; validating automatically decrements stock upon dispatch[cite: 1].
  * **Internal Transfers**: Relocate stock across internal locations (e.g., Main Store to Production Rack, Rack A to Rack B) with full ledger tracking[cite: 1].
  * **Inventory Adjustments**: Resolve discrepancies between physical counts and system balances with auto-generated adjustment records[cite: 1].
  * **Move History**: Complete audit trail showing all historical product movements across locations[cite: 1].

---

##  Database Schema Blueprint

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
