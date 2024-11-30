/*
  Warnings:

  - You are about to drop the column `answer` on the `surveys` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `surveys` DROP COLUMN `answer`,
    ADD COLUMN `topic` VARCHAR(191) NULL;
