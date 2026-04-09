-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('BLOB', 'LOCAL');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('POST_IMAGE', 'PROJECT_IMAGE', 'PRODUCT_IMAGE');

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "provider" "MediaProvider" NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_url_key" ON "MediaAsset"("url");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_pathname_key" ON "MediaAsset"("pathname");

-- CreateIndex
CREATE INDEX "MediaAsset_kind_createdAt_idx" ON "MediaAsset"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "MediaAsset_uploadedById_idx" ON "MediaAsset"("uploadedById");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
