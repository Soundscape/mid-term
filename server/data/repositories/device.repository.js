import { db } from "../index.js";
import { Device, DeviceSetting } from "../models/index.js";
import { deviceSettingRepository } from "./device-setting.repository.js";

/**
 * Retrieves a flat map of Devices.
 * Includes associated DeviceSettings.
 */
const baseQuery = `
SELECT
  \`d\`.\`Id\` as \`id\`,
  \`d\`.\`DeviceTypeId\` as \`deviceTypeId\`,
  \`d\`.\`Name\` as \`name\`,
  \`d0\`.\`DeviceId\` AS \`d0.deviceId\`,
  \`d0\`.\`DeviceTypeSettingId\` AS \`d0.deviceTypeSettingId\`,
  \`d0\`.\`Value\` AS \`d0.value\`
FROM \`Devices\` AS \`d\`
LEFT JOIN \`DeviceSettings\` AS \`d0\` ON \`d\`.\`Id\` = \`d0\`.\`DeviceId\`
`;

function convertDevices(data) {
  const devices = [
    ...new Set(
      data.map((d) =>
        JSON.stringify({ id: d.id, deviceTypeId: d.deviceTypeId, name: d.name })
      )
    ),
  ]
    .map((d) => new Device(JSON.parse(d)))
    .filter((d) => d.id !== null);

  devices.forEach((d) => (d.settings = convertDeviceSettings(d, data)));

  return devices;
}

function convertDeviceSettings(device, data) {
  const filteredData = data.filter((d) => d["d0.deviceId"] === device.id);

  const deviceSettings = [
    ...new Set(
      filteredData.map((d) =>
        JSON.stringify({
          deviceId: d["d0.deviceId"],
          deviceTypeSettingId: d["d0.deviceTypeSettingId"],
          value: d["d0.value"],
        })
      )
    ),
  ]
    .map((d) => new DeviceSetting(JSON.parse(d)))
    .filter((d) => d.id !== null);

  return deviceSettings;
}

export class DeviceRepository {
  /**
   * Retrieves a device by its ID.
   * Includes associated DeviceSettings.
   * 
   * @param {number} id  The device ID (Key)
   * @returns The device
   */
  async getById(id) {
    const query = `${baseQuery} WHERE \`id\` = ?`;

    const [data] = await db.promise().query(query, [id]);
    const result = data.length > 0 ? convertDevices(data)[0] : null;

    return result;
  }

  /**
   * Retrieves a list of devices.
   * Includes associated DeviceSettings.
   * 
   * @returns A list of devices
   */
  async get() {
    const query = `${baseQuery}`;

    const [data] = await db.promise().query(query, []);
    const result = convertDevices(data);

    return result;
  }

  /**
   * Creates a new device
   * @param {number} payload.deviceTypeId  The device type ID
   * @param {string} payload.name  The name
   * @returns The created device
   */
  async create(payload) {
    await db.promise().beginTransaction();
    const command =
      "INSERT INTO `Devices` (`DeviceTypeId`, `Name`) VALUES (?, ?);";

    const create = await db
      .promise()
      .execute(command, [payload.deviceTypeId, payload.name]);
    const result = await this.getById(create[0].insertId);

    if (payload.settings) {
      result.settings = await Promise.all(
        payload.settings.map(async (setting) => {
          setting.deviceId = create[0].insertId;
          const result = await deviceSettingRepository.create(setting);

          return result;
        })
      );
    }

    await db.promise().commit();

    return result;
  }

  /**
   * Updates the specified device
   * @param {number} payload.id  The device ID (Key)
   * @param {number} payload.deviceTypeId  The device type ID
   * @param {string} payload.name  The name
   * @returns The updated device device
   */
  async update(payload) {
    await db.promise().beginTransaction();
    const command =
      "UPDATE `Devices` SET `DeviceTypeId` = ?, `Name` = ? WHERE `Id` = ?;";

    await db
      .promise()
      .execute(command, [payload.deviceTypeId, payload.name, payload.id]);
    const result = await this.getById(payload.id);

    if (payload.settings) {
      result.settings = await Promise.all(
        payload.settings.map(async (setting) => {
          const result = await deviceSettingRepository.update(setting);

          return result;
        })
      );
    }

    await db.promise().commit();

    return result;
  }

  /**
   * Deletes the specified device
   * @param {number} id  The device ID (Key)
   * @returns No output
   */
  async delete(id) {
    const command = "DELETE FROM `Devices` WHERE `Id` = ?;";

    await db.promise().execute(command, [id]);
  }
}

export const deviceRepository = new DeviceRepository();
