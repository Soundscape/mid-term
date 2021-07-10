import { db } from "../index.js";

export class DeviceTypeSettingRepository {
  /**
   * Creates a new device type setting
   * @param {number} payload.deviceTypeId  The device type ID
   * @param {string} payload.name  The name
   * @param {string} payload.dataType  The data type ['String','Number','List','Boolean']
   * @param {boolean} payload.required  Is required
   * @param {number?} payload.min  The min value
   * @param {number?} payload.max  The max value
   * @param {number?} payload.step  The step amount
   * @returns The created device type setting
   */
  async create(payload) {
    const command =
      "INSERT INTO `DeviceTypeSettings` (`DeviceTypeId`, `Name`, `DataType`, `Required`, `Min`, `Max`, `Step`) VALUES (?, ?, ?, ?, ?, ?, ?);";

    const create = await db
      .promise()
      .execute(command, [
        payload.deviceTypeId,
        payload.name,
        payload.dataType,
        payload.required,
        payload.min,
        payload.max,
        payload.step,
      ]);
    const result = await this.getById(create[0].insertId);

    return result;
  }

  /**
   * Updates the specified device type setting
   * @param {number} payload.id  The device type setting ID (Key)
   * @param {number} payload.deviceTypeId  The device type ID
   * @param {string} payload.name  The name
   * @param {string} payload.dataType  The data type ['String','Number','List','Boolean']
   * @param {boolean} payload.required  Is required
   * @param {number?} payload.min  The min value
   * @param {number?} payload.max  The max value
   * @param {number?} payload.step  The step amount
   * @returns Updates the specified device type setting
   */
  async update(payload) {
    const command =
      "UPDATE `DeviceTypeSettings` SET `Name` = ?, `DataType` = ?, `Required` = ?, `Min` = ?, `Max` = ?, `Step` = ? WHERE `Id` = ?;";

    await db
      .promise()
      .execute(command, [
        payload.deviceTypeId,
        payload.name,
        payload.dataType,
        payload.required,
        payload.min,
        payload.max,
        payload.step,
        payload.id,
      ]);
    const result = await this.getById(payload.id);

    return result;
  }

  /**
   * Deletes the specified device type setting
   * @param {number} id  The device type setting ID (Key)
   * @returns No output
   */
  async delete(id) {
    const command = "DELETE FROM `DeviceTypeSettings` WHERE `Id` = ?;";

    await db.promise().execute(command, [id]);
  }
}

export const deviceTypeSettingRepository = new DeviceTypeSettingRepository();
