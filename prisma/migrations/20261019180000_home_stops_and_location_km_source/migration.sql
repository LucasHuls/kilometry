-- AlterTable
ALTER TABLE `TripStop` ADD COLUMN `isHome` BOOLEAN NOT NULL DEFAULT false;

-- Trips from before multi-stop only have their destination as a stop and implicitly
-- started at home. Move that destination to position 1 and add an explicit home start.
UPDATE `TripStop` s
    JOIN (SELECT `tripId` FROM `TripStop` GROUP BY `tripId` HAVING COUNT(*) = 1) single
    ON single.`tripId` = s.`tripId`
    SET s.`position` = 1;

INSERT INTO `TripStop` (`id`, `tripId`, `position`, `isHome`)
    SELECT UUID(), `tripId`, 0, true
    FROM `TripStop`
    GROUP BY `tripId`
    HAVING COUNT(*) = 1 AND MIN(`position`) = 1;

-- Stops saved as a copy of the home address become home stops.
UPDATE `TripStop` s
    JOIN `Trip` t ON t.`id` = s.`tripId`
    JOIN `User` u ON u.`id` = t.`userId`
    SET s.`isHome` = true, s.`address` = NULL, s.`postcode` = NULL, s.`placeId` = NULL
    WHERE s.`locationId` IS NULL
        AND s.`name` IS NULL
        AND u.`homeAddress` IS NOT NULL
        AND s.`address` = u.`homeAddress`
        AND s.`postcode` <=> u.`homePostcode`;

-- AlterTable
ALTER TABLE `Location` ADD COLUMN `kmFromRoute` BOOLEAN NOT NULL DEFAULT false;
