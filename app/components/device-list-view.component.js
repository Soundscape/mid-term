import { h } from "maquette";
import { BaseComponent } from "./base-component";

export class DeviceListViewComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.devices = [];
    this.deviceTypes = [];
    this.deviceTypeSettings = [];
  }

  async connectedCallback() {
    const [devices, deviceTypes] = await Promise.all([
      this.fetchDevices(),
      this.fetchDeviceTypes(),
    ]);

    this.devices = devices.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.deviceTypes = deviceTypes.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.deviceTypeSettings = this.deviceTypes.reduce(
      (agg, cur) => agg.concat(cur.settings),
      []
    );

    super.connectedCallback();
  }

  async fetchDeviceTypes() {
    const res = await fetch("/api/device-types/");
    return await res.json();
  }

  async fetchDevices() {
    const res = await fetch("/api/devices/");
    return await res.json();
  }

  getDeviceTypeSettingLabel(deviceSetting) {
    const deviceTypeSetting = this.deviceTypeSettings.find(
      (d) => d.id === deviceSetting.deviceTypeSettingId
    );

    let value = "";

    switch (deviceTypeSetting.dataType) {
      case "Boolean":
        value = deviceSetting.value === "1";
        break;
      case "Number":
        const floatValue = parseFloat(deviceSetting.value);
        const isFloat =
          Number(floatValue) === floatValue && floatValue % 1 !== 0;
        value = isFloat ? floatValue.toFixed(2) : floatValue;
        break;
      default:
        value = deviceSetting.value;
        break;
    }

    return `${deviceTypeSetting.name}: ${value}`;
  }

  render() {
    return h("div.p-4", [
      h("div.flex.justify-between.items-center", [
        h("h1.font-bold.text-sm.uppercase.text-gray-700", ["Devices"]),
        h(
          "a.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold.text-sm",
          { href: "/devices/add" },
          ["Create"]
        ),
      ]),
      h("div.mt-4.shadow.bg-white.rounded", [
        this.devices.map((d) =>
          h(
            "div.w-full.border-gray-100.rounded-t.border-b.hover:bg-blue-100.text-gray-700",
            [
              h(
                "div.grid.grid-rows-2.grid-cols-2.gap-2.w-full.py-2.px-4.border-transparent.border-l-2.relative.hover:border-blue-100",
                [
                  h("h3.font-semibold.col-span-2", [d.name]),
                  h("span.text-sm.text-gray-500", [
                    d.settings
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map((d) => this.getDeviceTypeSettingLabel(d))
                      .join(" | "),
                  ]),
                  h("div.text-right", [
                    h(
                      "a.text-blue-500.hover:underline",
                      { href: `/devices/${d.id}` },
                      ["View"]
                    ),
                    " | ",
                    h(
                      "a.text-blue-500.hover:underline",
                      { href: `/devices/${d.id}/edit` },
                      ["Edit"]
                    ),
                  ]),
                ]
              ),
            ]
          )
        ),
      ]),
    ]);
  }
}

customElements.define("ui-device-list-view", DeviceListViewComponent);
