-- AddForeignKey
ALTER TABLE `usersurveyanswers` ADD CONSTRAINT `usersurveyanswers_id_question_fkey` FOREIGN KEY (`id_question`) REFERENCES `surveys`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
