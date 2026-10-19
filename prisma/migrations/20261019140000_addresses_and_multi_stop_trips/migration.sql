-- AlterTable
ALTER TABLE `Location` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `placeId` VARCHAR(191) NULL,
    ADD COLUMN `postcode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `exportIncludePostcodes` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `homeAddress` VARCHAR(191) NULL,
    ADD COLUMN `homePlaceId` VARCHAR(191) NULL,
    ADD COLUMN `homePostcode` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `TripStop` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `locationId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NULL,
    `placeId` VARCHAR(191) NULL,

    INDEX `TripStop_tripId_idx`(`tripId`),
    INDEX `TripStop_locationId_idx`(`locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Move each existing trip's single destination into a TripStop. These trips have no
-- explicit starting point (it was implicitly the user's home), so they get one stop.
INSERT INTO `TripStop` (`id`, `tripId`, `position`, `locationId`, `name`)
    SELECT UUID(), `id`, 0, `locationId`, IF(`locationId` IS NULL, `customLocation`, NULL)
    FROM `Trip`;

-- DropForeignKey
ALTER TABLE `Trip` DROP FOREIGN KEY `Trip_locationId_fkey`;

-- AlterTable
ALTER TABLE `Trip` DROP COLUMN `customLocation`,
    DROP COLUMN `locationId`,
    ADD COLUMN `returnKm` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `TripStop` ADD CONSTRAINT `TripStop_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripStop` ADD CONSTRAINT `TripStop_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
