-- AddForeignKey
ALTER TABLE `certificatequestionanswers` ADD CONSTRAINT `certificatequestionanswers_id_certificate_question_fkey` FOREIGN KEY (`id_certificate_question`) REFERENCES `certificatequestions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
