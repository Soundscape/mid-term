import { db } from "../index.js";

export class DeviceTypeSettingRepository {
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

  async delete(id) {
    const command = "DELETE FROM `DeviceTypeSettings` WHERE `Id` = ?;";

    await db.promise().execute(command, [id]);
  }
}

export const deviceTypeSettingRepository = new DeviceTypeSettingRepository();
