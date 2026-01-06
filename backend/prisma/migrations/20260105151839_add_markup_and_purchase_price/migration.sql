/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Part` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Part" ADD COLUMN     "markup" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "createdAt",
ALTER COLUMN "role" SET DEFAULT 'admin';

-- CreateIndex
CREATE UNIQUE INDEX "Part_code_key" ON "Part"("code");
