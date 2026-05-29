-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 0;
