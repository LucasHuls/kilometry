-- AlterTable
ALTER TABLE `Trip` ADD COLUMN `customLocation` VARCHAR(191) NULL,
    ADD COLUMN `isReturnTrip` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `locationId` VARCHAR(191) NULL;
