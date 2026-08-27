-- AlterTable
ALTER TABLE `Trip` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `exportIncludeDescription` BOOLEAN NOT NULL DEFAULT true;
