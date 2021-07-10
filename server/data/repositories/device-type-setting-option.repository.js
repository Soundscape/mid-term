import { db } from "../index.js";

export class DeviceTypeSettingOptionRepository {
  /**
   * Creates a new device type setting option
   * @param {number} payload.deviceTypeSettingId  The device type setting ID
   * @param {string} payload.text  The text
   * @param {string} payload.value  The value
   * @returns The created device setting option
   */
  async create(payload) {
    const command =
      "INSERT INTO `DeviceTypeSettingOptions` (`DeviceTypeSettingId`, `Text`, `Value`) VALUES (?, ?, ?);";

    const create = await db
      .promise()
      .execute(command, [
        payload.deviceTypeSettingId,
        payload.text,
        payload.value,
      ]);
    const result = await this.getById(create[0].insertId);

    return result;
  }

  /**
   * Updates the specified device type setting option
   * @param {number} payload.id  The device type setting option ID (Key)
   * @param {number} payload.deviceTypeSettingId  The device type setting ID
   * @param {string} payload.text  The text
   * @param {string} payload.value  The value
   * @returns The updated device setting option
   */
  async update(payload) {
    const command =
      "UPDATE `DeviceTypeSettingOptions` SET `DeviceTypeSettingId` = ?, `Text` = ?, `Value` = ? WHERE `Id` = ?;";

    await db
      .promise()
      .execute(command, [
        payload.deviceTypeSettingId,
        payload.text,
        payload.value,
      ]);
    const result = await this.getById(payload.id);

    return result;
  }

  /**
   * Deletes the specified device type setting option
   * @param {number} id  The device type setting option ID (Key)
   * @returns No output
   */
  async delete(id) {
    const command = "DELETE FROM `DeviceTypeSettingOptions` WHERE `Id` = ?;";

    await db.promise().execute(command, [id]);
  }
}

export const deviceTypeSettingOptionRepository =
  new DeviceTypeSettingOptionRepository();
