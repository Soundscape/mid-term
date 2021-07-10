import { db } from "../index.js";

export class DeviceSettingRepository {
  /**
   * Creates a new device setting
   * @param {number} payload.deviceId  The device ID (Composite Key)
   * @param {number} payload.deviceTypeSettingId  The device type setting ID (Composite Key)
   * @param {string} payload.value  The value
   * @returns The created device setting
   */
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

  /**
   * Updates the specified device setting
   * @param {number} payload.deviceId  The device ID (Composite Key)
   * @param {number} payload.deviceTypeSettingId  The device type setting ID (Composite Key)
   * @param {string} payload.value  The value
   * @returns The updated device setting
   */
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

  /**
   * Deletes the specified device setting
   * @param {number} deviceId  The device ID (Composite Key)
   * @param {number} deviceTypeSettingId  The device type setting ID (Composite Key)
   * @returns No output
   */
  async delete({ deviceId, deviceTypeSettingId }) {
    const command =
      "DELETE FROM `DeviceSettings` WHERE `DeviceId` = ? AND `DeviceTypeSettingId` = ?;";

    await db.promise().execute(command, [deviceId, deviceTypeSettingId]);
  }
}

export const deviceSettingRepository = new DeviceSettingRepository();
