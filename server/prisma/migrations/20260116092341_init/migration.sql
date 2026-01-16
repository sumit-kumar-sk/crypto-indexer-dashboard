-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "blockNum" BIGINT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_number_chain_key" ON "Block"("number", "chain");

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_chain_key" ON "Block"("hash", "chain");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE INDEX "Transaction_from_idx" ON "Transaction"("from");

-- CreateIndex
CREATE INDEX "Transaction_to_idx" ON "Transaction"("to");

-- CreateIndex
CREATE INDEX "Transaction_chain_blockNum_idx" ON "Transaction"("chain", "blockNum");
