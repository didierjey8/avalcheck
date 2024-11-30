-- CreateTable
CREATE TABLE `certificatequestions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` ENUM('BASIC', 'MEDIUM', 'ADVANCED') NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;