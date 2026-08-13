-- AlterTable
ALTER TABLE `User` ADD COLUMN `defaultReturnTrip` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `exportIncludeFee` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `exportIncludeKm` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `exportIncludeLocation` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `exportIncludeRetour` BOOLEAN NOT NULL DEFAULT true;
