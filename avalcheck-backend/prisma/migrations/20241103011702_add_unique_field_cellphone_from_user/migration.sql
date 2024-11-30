/*
  Warnings:

  - A unique constraint covering the columns `[cellphone]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `users_cellphone_key` ON `users`(`cellphone`);
