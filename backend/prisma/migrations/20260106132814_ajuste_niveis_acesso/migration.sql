/*
  Warnings:

  - Added the required column `mechanicId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "mechanicId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending_approval',
ALTER COLUMN "totalCost" SET DEFAULT 0;
