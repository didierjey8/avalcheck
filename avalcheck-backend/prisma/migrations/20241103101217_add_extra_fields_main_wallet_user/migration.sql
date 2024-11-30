-- AlterTable
ALTER TABLE `users` ADD COLUMN `mnemonic_main_avalanche_wallet` VARCHAR(191) NULL,
    ADD COLUMN `xpub_main_avalanche_wallet` VARCHAR(191) NULL;
