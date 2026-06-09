-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "restaurants" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Trip" ADD COLUMN "hotel" TEXT;
