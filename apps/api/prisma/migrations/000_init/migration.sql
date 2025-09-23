CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Tenant" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Manila',
  "currency" TEXT NOT NULL DEFAULT 'PHP',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE "UserRole" AS ENUM ('admin','staff');

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'staff',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TYPE "StockLedgerType" AS ENUM ('RECEIPT','ISSUE','ADJUST','TRANSFER_IN','TRANSFER_OUT');
CREATE TYPE "StockLedgerRefType" AS ENUM ('PO','SO','ADJ','TX');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT','OPEN','RECEIVED','FULFILLED','CLOSED');

CREATE TABLE "Warehouse" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT,
  CONSTRAINT "Warehouse_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Warehouse_code_org_unique" UNIQUE ("orgId", "code")
);

CREATE TABLE "Product" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "barcode" TEXT,
  "uom" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Product_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Product_sku_org_unique" UNIQUE ("orgId", "sku")
);
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

CREATE TABLE "InventoryBalance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "warehouseId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "qty" NUMERIC(18,3) NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "InventoryBalance_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "InventoryBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE,
  CONSTRAINT "InventoryBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
  CONSTRAINT "InventoryBalance_unique" UNIQUE ("orgId", "warehouseId", "productId")
);
CREATE INDEX "InventoryBalance_warehouse_idx" ON "InventoryBalance"("warehouseId");
CREATE INDEX "InventoryBalance_product_idx" ON "InventoryBalance"("productId");

CREATE TABLE "StockLedger" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "type" "StockLedgerType" NOT NULL,
  "warehouseId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "qty" NUMERIC(18,3) NOT NULL,
  "refType" "StockLedgerRefType" NOT NULL,
  "refId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "StockLedger_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "StockLedger_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE,
  CONSTRAINT "StockLedger_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);
CREATE INDEX "StockLedger_createdAt_idx" ON "StockLedger"("createdAt");
CREATE INDEX "StockLedger_product_idx" ON "StockLedger"("productId");

CREATE TABLE "PurchaseOrder" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "supplierName" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "PurchaseOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE "PurchaseOrderItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "poId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "qty" NUMERIC(18,3) NOT NULL,
  "unitPrice" NUMERIC(18,2) NOT NULL DEFAULT 0,
  CONSTRAINT "POItem_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
  CONSTRAINT "POItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE TABLE "SalesOrder" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "customerName" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "SalesOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE TABLE "SalesOrderItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "soId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "qty" NUMERIC(18,3) NOT NULL,
  "unitPrice" NUMERIC(18,2) NOT NULL DEFAULT 0,
  CONSTRAINT "SOItem_soId_fkey" FOREIGN KEY ("soId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE,
  CONSTRAINT "SOItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE TABLE "Transfer" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "fromWarehouseId" UUID NOT NULL,
  "toWarehouseId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Transfer_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "Transfer_fromWarehouse_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id"),
  CONSTRAINT "Transfer_toWarehouse_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id")
);

CREATE TABLE "TransferItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "transferId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "qty" NUMERIC(18,3) NOT NULL,
  CONSTRAINT "TransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE CASCADE,
  CONSTRAINT "TransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE TABLE "DeviceSyncState" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "deviceId" TEXT NOT NULL,
  "lastSyncedAt" TIMESTAMPTZ NOT NULL,
  "serverClock" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "DeviceSyncState_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "DeviceSyncState_unique" UNIQUE ("orgId", "deviceId")
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "userId" UUID,
  CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
