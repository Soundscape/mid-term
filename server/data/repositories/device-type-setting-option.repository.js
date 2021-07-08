import { db } from "../index.js";

export class DeviceTypeSettingOptionRepository {
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

  async delete(id) {
    const command = "DELETE FROM `DeviceTypeSettingOptions` WHERE `Id` = ?;";

    await db.promise().execute(command, [id]);
  }
}

export const deviceTypeSettingOptionRepository =
  new DeviceTypeSettingOptionRepository();
