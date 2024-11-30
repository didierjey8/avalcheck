/*
  Warnings:

  - You are about to alter the column `answer` on the `surveys` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- DropIndex
DROP INDEX `surveys_answer_key` ON `surveys`;

-- AlterTable
ALTER TABLE `surveys` MODIFY `answer` ENUM('YES', 'NO') NOT NULL;
