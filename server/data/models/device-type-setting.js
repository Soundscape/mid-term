export class DeviceTypeSetting {
  constructor({ id, deviceTypeId, name, dataType, required, min, max, step }) {
    this.id = id;
    this.deviceTypeId = deviceTypeId;
    this.name = name;
    this.dataType = dataType;
    this.required = required;
    this.min = min;
    this.max = max;
    this.step = step;

    this.options = [];
  }
}
