import { db } from "../index.js";
import {
  DeviceType,
  DeviceTypeSetting,
  DeviceTypeSettingOption,
} from "../models/index.js";

/**
 * Retrieves a flat map of DeviceTypes.
 * Includes associated DeviceTypeSettings and DeviceTypeSettingOptions.
 */
const baseQuery = `
SELECT
  \`d\`.\`Id\` as \`id\`,
  \`d\`.\`Name\` as \`name\`,
  \`t\`.*
FROM \`DeviceTypes\` AS \`d\`
LEFT JOIN (
	SELECT
		\`d0\`.\`Id\` AS \`d0.id\`,
    \`d0\`.\`DeviceTypeId\` AS \`d0.deviceTypeId\`,
    \`d0\`.\`Name\` AS \`d0.name\`,
    \`d0\`.\`DataType\` AS \`d0.dataType\`,
    \`d0\`.\`Required\` AS \`d0.required\`,
    \`d0\`.\`Min\` AS \`d0.min\`,
    \`d0\`.\`Max\` AS \`d0.max\`,
    \`d0\`.\`Step\` AS \`d0.step\`,
    \`d1\`.\`Id\` AS \`d1.id\`,
    \`d1\`.\`DeviceTypeSettingId\` AS \`d1.deviceTypeSettingId\`,
    \`d1\`.\`Text\` AS \`d1.text\`,
    \`d1\`.\`Value\` AS \`d1.value\`
  FROM \`DeviceTypeSettings\` AS \`d0\`
  LEFT JOIN \`DeviceTypeSettingOptions\` AS \`d1\` on \`d0\`.\`Id\` = \`d1\`.\`DeviceTypeSettingId\`
) AS \`t\` ON \`d\`.\`Id\` = \`t\`.\`d0.DeviceTypeId\`
`;

function convertDeviceTypes(data) {
  const deviceTypes = [
    ...new Set(data.map((d) => JSON.stringify({ id: d.id, name: d.name }))),
  ]
    .map((d) => new DeviceType(JSON.parse(d)))
    .filter((d) => d.id !== null);

  deviceTypes.forEach((d) => (d.settings = convertDeviceTypeSettings(d, data)));

  return deviceTypes;
}

function convertDeviceTypeSettings(deviceType, data) {
  const filteredData = data.filter(
    (d) => d["d0.deviceTypeId"] === deviceType.id
  );

  const deviceTypeSettings = [
    ...new Set(
      filteredData.map((d) =>
        JSON.stringify({
          id: d["d0.id"],
          deviceTypeId: d["d0.deviceTypeId"],
          name: d["d0.name"],
          dataType: d["d0.dataType"],
          required: d["d0.required"],
          min: d["d0.min"],
          max: d["d0.max"],
          step: d["d0.step"],
        })
      )
    ),
  ]
    .map((d) => new DeviceTypeSetting(JSON.parse(d)))
    .filter((d) => d.id !== null);

  deviceTypeSettings.forEach(
    (d) => (d.options = convertDeviceTypeSettingOptions(d, filteredData))
  );

  return deviceTypeSettings;
}

function convertDeviceTypeSettingOptions(deviceTypeSetting, data) {
  const filteredData = data.filter(
    (d) => d["d1.deviceTypeSettingId"] === deviceTypeSetting.id
  );

  const deviceTypeSettingOptions = [
    ...new Set(
      filteredData.map((d) =>
        JSON.stringify({
          id: d["d1.id"],
          deviceTypeSettingId: d["d1.deviceTypeSettingId"],
          text: d["d1.text"],
          value: d["d1.value"],
        })
      )
    ),
  ]
    .map((d) => new DeviceTypeSettingOption(JSON.parse(d)))
    .filter((d) => d.id !== null);

  return deviceTypeSettingOptions;
}

export class DeviceTypeRepository {
  /**
   * Retrieves a device type by its ID.
   * Includes associated DeviceTypeSettings and DeviceTypeSettingOptions.
   * 
   * @param {number} id  The device type ID (Key)
   * @returns The device type
   */
  async getById(id) {
    const query = `${baseQuery} WHERE \`id\` = ?`;

    const [data] = await db.promise().query(query, [id]);
    const result = data.length > 0 ? convertDeviceTypes(data)[0] : null;

    return result;
  }

  /**
   * Retrieves a list of device types.
   * Includes associated DeviceTypeSettings and DeviceTypeSettingOptions.
   * 
   * @returns A list of device types
   */
  async get() {
    const query = `${baseQuery}`;

    const [data] = await db.promise().query(query, []);
    const result = convertDeviceTypes(data);

    return result;
  }

  /**
   * Creates a new device type
   * @param {string} payload.name  The name
   * @returns The created device type
   */
  async create(payload) {
    const command = "INSERT INTO `DeviceTypes` (`Name`) VALUES (?);";

    const create = await db.promise().execute(command, [payload.name]);
    const result = await this.getById(create[0].insertId);

    return result;
  }

  /**
   * Updates the specified device type
   * @param {number} payload.id  The device type ID (Key)
   * @param {string} payload.name  The name
   * @returns The updated device device type
   */
  async update(payload) {
    const command = "UPDATE `DeviceTypes` SET `Name` = ? WHERE `Id` = ?;";

    await db.promise().execute(command, [payload.name, payload.id]);
    const result = await this.getById(payload.id);

    return result;
  }

  /**
   * Deletes the specified device type
   * @param {number} id  The device type ID (Key)
   * @returns No output
   */
  async delete(id) {
    const command = "DELETE FROM `DeviceTypes` WHERE `Id` = ?;";

    await db.promise().execute(command, [id]);
  }
}

export const deviceTypeRepository = new DeviceTypeRepository();
