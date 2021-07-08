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

