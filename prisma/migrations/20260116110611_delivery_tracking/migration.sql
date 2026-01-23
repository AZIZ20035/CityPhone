-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNo" TEXT NOT NULL,
    "customerName" TEXT,
    "mobile" TEXT,
    "deviceType" TEXT,
    "problem" TEXT,
    "staffReceiver" TEXT,
    "deviceStatus" TEXT NOT NULL DEFAULT 'NEW',
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "receiverName" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "contactedCustomer" BOOLEAN NOT NULL DEFAULT false,
    "agreedPrice" REAL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("agreedPrice", "contactedCustomer", "createdAt", "createdByUserId", "customerName", "deviceStatus", "deviceType", "id", "invoiceNo", "mobile", "notes", "problem", "staffReceiver", "updatedAt") SELECT "agreedPrice", "contactedCustomer", "createdAt", "createdByUserId", "customerName", "deviceStatus", "deviceType", "id", "invoiceNo", "mobile", "notes", "problem", "staffReceiver", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");
CREATE INDEX "Invoice_invoiceNo_idx" ON "Invoice"("invoiceNo");
CREATE INDEX "Invoice_mobile_idx" ON "Invoice"("mobile");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
