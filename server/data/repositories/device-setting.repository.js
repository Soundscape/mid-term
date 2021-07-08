import { db } from "../index.js";

export class DeviceSettingRepository {
  async create(payload) {
    const command =
      "INSERT INTO `DeviceSettings` (`DeviceId`, `DeviceTypeSettingId`, `Value`) VALUES (?, ?, ?);";

    await db
      .promise()
      .execute(command, [
        payload.deviceId,
        payload.deviceTypeSettingId,
        payload.value,
      ]);

    return payload;
  }

  async update(payload) {
    const command =
      "UPDATE `DeviceSettings` SET `Value` = ? WHERE `DeviceId` = ? AND `DeviceTypeSettingId` = ?;";

    await db
      .promise()
      .execute(command, [
        payload.value,
        payload.deviceId,
        payload.deviceTypeSettingId,
      ]);

    return payload;
  }

  async delete({ deviceId, deviceTypeSettingId }) {
    const command =
      "DELETE FROM `DeviceSettings` WHERE `DeviceId` = ? AND `DeviceTypeSettingId` = ?;";

    await db.promise().execute(command, [deviceId, deviceTypeSettingId]);
  }
}

export const deviceSettingRepository = new DeviceSettingRepository();
