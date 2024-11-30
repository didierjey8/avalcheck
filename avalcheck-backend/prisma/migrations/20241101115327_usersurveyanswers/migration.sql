-- CreateTable
CREATE TABLE `usersurveyanswers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_question` INTEGER NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer_question` ENUM('YES', 'NO') NOT NULL,
    `answer_user` ENUM('YES', 'NO') NOT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
