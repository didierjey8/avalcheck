/*
  Warnings:

  - You are about to drop the column `answer_question` on the `usersurveyanswers` table. All the data in the column will be lost.
  - You are about to alter the column `answer_user` on the `usersurveyanswers` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `usersurveyanswers` DROP COLUMN `answer_question`,
    ADD COLUMN `address_gift` VARCHAR(191) NULL,
    ADD COLUMN `amount_gift` VARCHAR(191) NULL,
    ADD COLUMN `currency_gift` VARCHAR(191) NULL,
    ADD COLUMN `tx_gift` VARCHAR(191) NULL,
    ADD COLUMN `won` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `answer_user` VARCHAR(191) NOT NULL;
