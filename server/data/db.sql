ALTER DATABASE CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET utf8mb4;

START TRANSACTION;

ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `DeviceTypes` (
    `Id` bigint NOT NULL AUTO_INCREMENT,
    `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_DeviceTypes` PRIMARY KEY (`Id`)
) CHARACTER SET utf8mb4;

CREATE TABLE `Devices` (
    `Id` bigint NOT NULL AUTO_INCREMENT,
    `DeviceTypeId` bigint NOT NULL,
    `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Devices` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Devices_DeviceTypes_DeviceTypeId` FOREIGN KEY (`DeviceTypeId`) REFERENCES `DeviceTypes` (`Id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

CREATE TABLE `DeviceTypeSettings` (
    `Id` bigint NOT NULL AUTO_INCREMENT,
    `DeviceTypeId` bigint NOT NULL,
    `Name` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `DataType` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `Required` tinyint(1) NOT NULL,
    `Min` float NULL,
    `Max` float NULL,
    `Step` float NULL,
    CONSTRAINT `PK_DeviceTypeSettings` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_DeviceTypeSettings_DeviceTypes_DeviceTypeId` FOREIGN KEY (`DeviceTypeId`) REFERENCES `DeviceTypes` (`Id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

CREATE TABLE `DeviceSettings` (
    `DeviceId` bigint NOT NULL,
    `DeviceTypeSettingId` bigint NOT NULL,
    `Value` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_DeviceSettings` PRIMARY KEY (`DeviceId`, `DeviceTypeSettingId`),
    CONSTRAINT `FK_DeviceSettings_Devices_DeviceId` FOREIGN KEY (`DeviceId`) REFERENCES `Devices` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_DeviceSettings_DeviceTypeSettings_DeviceTypeSettingId` FOREIGN KEY (`DeviceTypeSettingId`) REFERENCES `DeviceTypeSettings` (`Id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

CREATE TABLE `DeviceTypeSettingOptions` (
    `Id` bigint NOT NULL AUTO_INCREMENT,
    `DeviceTypeSettingId` bigint NOT NULL,
    `Text` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `Value` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_DeviceTypeSettingOptions` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_DeviceTypeSettingOptions_DeviceTypeSettings_DeviceTypeSettin~` FOREIGN KEY (`DeviceTypeSettingId`) REFERENCES `DeviceTypeSettings` (`Id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;

CREATE INDEX `IX_Devices_DeviceTypeId` ON `Devices` (`DeviceTypeId`);

CREATE INDEX `IX_DeviceSettings_DeviceTypeSettingId` ON `DeviceSettings` (`DeviceTypeSettingId`);

CREATE INDEX `IX_DeviceTypeSettingOptions_DeviceTypeSettingId` ON `DeviceTypeSettingOptions` (`DeviceTypeSettingId`);

CREATE INDEX `IX_DeviceTypeSettings_DeviceTypeId` ON `DeviceTypeSettings` (`DeviceTypeId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20210701100300_InitialSchema', '5.0.7');

COMMIT;

START TRANSACTION;

INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (1, 'Dimmable Light');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (2, 'Light');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (3, 'Magnetic Door');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (4, 'Air Conditioner');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (5, 'Television');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (6, 'Sprinkler');

INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (1, 'Boolean', 1, NULL, NULL, 'On/Off', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (2, 'Number', 1, 1, 0, 'Intensity', TRUE, 0.1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (3, 'Boolean', 2, NULL, NULL, 'On/Off', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (4, 'Boolean', 3, NULL, NULL, 'Locked/Unlocked', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (5, 'Boolean', 4, NULL, NULL, 'On/Off', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (6, 'Number', 4, 30, 18, 'Temperature', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (7, 'Boolean', 5, NULL, NULL, 'On/Off', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (8, 'Number', 5, 20, 1, 'Channel', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (9, 'Number', 5, 50, 0, 'Volume', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (10, 'Boolean', 6, NULL, NULL, 'On/Off', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (11, 'List', 6, NULL, NULL, 'Speed', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (12, 'List', 6, NULL, NULL, 'Schedule', TRUE, NULL);

INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (1, 11, 'Low', 'low');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (25, 12, '21:00', '21:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (24, 12, '20:00', '20:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (23, 12, '19:00', '19:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (22, 12, '18:00', '18:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (21, 12, '17:00', '17:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (20, 12, '16:00', '16:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (19, 12, '15:00', '15:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (18, 12, '14:00', '14:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (17, 12, '13:00', '13:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (16, 12, '12:00', '12:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (15, 12, '11:00', '11:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (26, 12, '22:00', '22:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (14, 12, '10:00', '10:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (12, 12, '08:00', '08:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (11, 12, '07:00', '07:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (10, 12, '06:00', '06:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (9, 12, '05:00', '05:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (8, 12, '04:00', '04:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (7, 12, '03:00', '03:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (6, 12, '02:00', '02:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (5, 12, '01:00', '01:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (4, 12, '00:00', '00:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (3, 11, 'High', 'high');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (2, 11, 'Medium', 'medium');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (13, 12, '09:00', '09:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (27, 12, '23:00', '23:00');

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20210701104211_SeedDeviceTypes', '5.0.7');

COMMIT;

START TRANSACTION;

UPDATE `DeviceTypeSettings` SET `Name` = 'Active'
WHERE `Id` = 1;
SELECT ROW_COUNT();


UPDATE `DeviceTypeSettings` SET `Name` = 'Active'
WHERE `Id` = 3;
SELECT ROW_COUNT();


UPDATE `DeviceTypeSettings` SET `Name` = 'Locked'
WHERE `Id` = 4;
SELECT ROW_COUNT();


UPDATE `DeviceTypeSettings` SET `Name` = 'Active'
WHERE `Id` = 5;
SELECT ROW_COUNT();


UPDATE `DeviceTypeSettings` SET `Name` = 'Active'
WHERE `Id` = 7;
SELECT ROW_COUNT();


UPDATE `DeviceTypeSettings` SET `Name` = 'Active'
WHERE `Id` = 10;
SELECT ROW_COUNT();


INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (20, 'Grow Light');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (19, 'Gas Sensor');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (18, 'Gas Sensor');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (17, 'Security Camera');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (16, 'Vacuum');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (14, 'Pool Ph Regulator');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (13, 'Fridge');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (12, 'Sound System');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (11, 'Alarm');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (10, 'Boiler');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (9, 'Driveway Gate');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (8, 'Garage Door');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (15, 'Pool Level Regulator');
INSERT INTO `DeviceTypes` (`Id`, `Name`)
VALUES (7, 'Electric Blinds');

INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (13, 'Number', 7, 1, 0, 'Position', TRUE, 0.1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (29, 'Boolean', 18, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (28, 'Boolean', 17, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (27, 'List', 16, NULL, NULL, 'Schedule', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (26, 'Boolean', 16, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (25, 'Number', 15, 10, 0, 'Height', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (24, 'Number', 14, 7.8, 7.2, 'Temperature', TRUE, 0.1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (23, 'Boolean', 14, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (30, 'Boolean', 19, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (22, 'Number', 13, 10, -18, 'Temperature', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (20, 'Number', 12, 50, 0, 'Volume', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (19, 'Boolean', 12, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (18, 'Boolean', 11, NULL, NULL, 'Armed', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (17, 'Number', 10, 75, 40, 'Temperature', TRUE, 1);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (16, 'Boolean', 10, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (15, 'Boolean', 9, NULL, NULL, 'Open', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (14, 'Boolean', 8, NULL, NULL, 'Open', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (21, 'Boolean', 13, NULL, NULL, 'On', TRUE, NULL);
INSERT INTO `DeviceTypeSettings` (`Id`, `DataType`, `DeviceTypeId`, `Max`, `Min`, `Name`, `Required`, `Step`)
VALUES (31, 'Boolean', 20, NULL, NULL, 'On', TRUE, NULL);

INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (28, 27, '00:00', '00:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (49, 27, '21:00', '21:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (48, 27, '20:00', '20:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (47, 27, '19:00', '19:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (46, 27, '18:00', '18:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (45, 27, '17:00', '17:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (44, 27, '16:00', '16:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (43, 27, '15:00', '15:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (42, 27, '14:00', '14:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (41, 27, '13:00', '13:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (40, 27, '12:00', '12:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (39, 27, '11:00', '11:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (38, 27, '10:00', '10:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (37, 27, '09:00', '09:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (36, 27, '08:00', '08:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (35, 27, '07:00', '07:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (34, 27, '06:00', '06:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (33, 27, '05:00', '05:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (32, 27, '04:00', '04:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (31, 27, '03:00', '03:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (30, 27, '02:00', '02:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (29, 27, '01:00', '01:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (50, 27, '22:00', '22:00');
INSERT INTO `DeviceTypeSettingOptions` (`Id`, `DeviceTypeSettingId`, `Text`, `Value`)
VALUES (51, 27, '23:00', '23:00');

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20210710065110_MoreDeviceTypes', '5.0.7');

COMMIT;

