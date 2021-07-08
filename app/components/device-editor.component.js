import { h } from "maquette";
import { BaseComponent } from "./base-component";

export class DeviceEditorComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.deviceTypes = [];
    this.device = null;

    this.infoViewDetails = {
      color: "red",
      icon: "",
      message: "",
    };

    this.eventListeners = new Map();
  }

  get deviceId() {
    return this.getAttribute("device-id") || null;
  }

  get deviceType() {
    return this.deviceTypes.find((d) => d.id === this.device.deviceTypeId);
  }

  get modal() {
    return this.node.querySelector("ui-confirm");
  }

  get mode() {
    return this.getAttribute("mode") || "view";
  }

  set mode(value) {
    const values = ["view", "edit", "create"];
    this.setAttribute(
      "mode",
      values.indexOf(value.toLowerCase()) !== -1 ? value.toLowerCase() : "view"
    );
    this.projector.renderNow();
  }

  get view() {
    return this.getAttribute("view") || "form";
  }

  set view(value) {
    const values = ["form", "info"];
    this.setAttribute(
      "view",
      values.indexOf(value.toLowerCase()) !== -1 ? value.toLowerCase() : "form"
    );
    this.projector.renderNow();
  }

  async connectedCallback() {
    const [device, deviceTypes] = await Promise.all([
      this.fetchDevice(),
      this.fetchDeviceTypes(),
    ]);

    this.device = device;
    this.deviceTypes = deviceTypes.sort((a, b) => (a.name > b.name ? 1 : -1));

    super.connectedCallback();
  }

  async fetchDeviceTypes() {
    const res = await fetch("/api/device-types/");

    if (res.status !== 200) {
      this.setInfoViewDetails(
        "red",
        "fa-times",
        "Device types could not be loaded"
      );
      this.view = "info";
      return [];
    }

    return await res.json();
  }

  async fetchDevice() {
    const emptyDevice = {
      id: null,
      deviceTypeId: null,
      name: "",
      settings: [],
    };
    if (!this.deviceId) return emptyDevice;

    const res = await fetch(`/api/devices/${this.deviceId}`);

    if (res.status !== 200) {
      this.setInfoViewDetails("red", "fa-times", "Device could not be found");
      this.view = "info";
      return emptyDevice;
    }

    return await res.json();
  }

  setInfoViewDetails(color, icon, message) {
    Object.assign(this.infoViewDetails, { color, icon, message });
  }

  handleDelete(e) {
    e.preventDefault();

    this.modal.message = `Are you sure you wish to delete this device?`;
    this.modal.open();
  }

  async handleDeleteChoice(e) {
    e.preventDefault();

    if (!e.detail) return;

    try {
      const res = await fetch(`/api/devices/${this.device.id}`, {
        method: "DELETE",
      });

      if (res.status !== 204)
        throw new Error(`Failed to delete: HTTP ${res.status}`);

      this.setInfoViewDetails("green", "fa-check", "Device was deleted");
      this.view = "info";
    } catch (err) {
      console.error(err);
      this.setInfoViewDetails("red", "fa-times", "Device could not be deleted");
      this.view = "info";
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    try {
      const settings = this.node.querySelector("div.settings");
      const createSettingValue = (el) => {
        const setting = {
          deviceId: this.device.id,
          deviceTypeSettingId: el.name,
          value: el.value,
        };

        return setting;
      };

      const settingValues = [
        ...settings.querySelectorAll(
          'input[type="text"],select,ui-slider,ui-toggle'
        ),
      ].map(createSettingValue);

      this.device.settings = settingValues;

      const res = await fetch(
        this.device.id ? `/api/devices/${this.device.id}` : "/api/devices",
        {
          method: this.device.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.device),
        }
      );

      await res.json();

      this.setInfoViewDetails("green", "fa-check", "Device saved successfully");
      this.view = "info";
    } catch (err) {
      console.error(err);
      this.setInfoViewDetails("red", "fa-times", "Device could not be saved");
      this.view = "info";
    }
  }

  handleNameChange(e) {
    e.preventDefault();

    this.device.name = e.target.value;
  }

  handleDeviceTypeChange(e) {
    e.preventDefault();

    const deviceTypeId = parseInt(e.target.value);
    this.device.deviceTypeId = deviceTypeId;

    this.projector.renderNow();
  }

  handleAfterCreate(el, eventName, handlerName) {
    this.eventListeners.set(handlerName, this[handlerName].bind(this));
    el.addEventListener(eventName, this.eventListeners.get(handlerName));
  }

  handleAfterRemoved(el, eventName, handlerName) {
    if (!this.eventListeners.has(handlerName)) return;
    el.removeEventListener(eventName, this.eventListeners.get(handlerName));
    this.eventListeners.delete(handlerName);
  }

  renderInfoView() {
    if (this.view !== "info") return null;

    return h("div.info-view", [
      h("div.flex.items-center", [
        h(
          `div.rounded-full.bg-${this.infoViewDetails.color}-100.h-10.w-10.flex.items-center.justify-center`,
          [
            h(
              `i.fas.${this.infoViewDetails.icon}.text-xl.opacity-75.text-${this.infoViewDetails.color}-500`
            ),
          ]
        ),
        h("h3.ml-4.text-lg.leading-6.font-medium.text-gray-900", [
          this.infoViewDetails.message,
        ]),
      ]),
      h("div.ml-14.my-4", [
        h(
          "a.btn-continue.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold",
          { href: "/" },
          ["Continue"]
        ),
      ]),
    ]);
  }

  renderFormHeader() {
    if (this.view !== "form") return null;

    let title = "";
    switch (this.mode) {
      case "edit":
        title = `Edit: ${this.device.name}`;
        break;
      case "create":
        title = `Create a device`;
        break;
      default:
        title = `View: ${this.device.name}`;
        break;
    }

    return h("div.flex.justify-between.items-center", [
      h(
        "h1.font-bold.text-sm.uppercase.text-gray-700.overflow-ellipsis.overflow-hidden.whitespace-nowrap",
        [title]
      ),
      h("div.text-right", [
        ["view", "edit"].indexOf(this.mode) !== -1
          ? h(
              "button.btn-delete.m-1.sm:m-0.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-gray-400.hover:bg-gray-500.outline-none.focus:border-gray-900.font-semibold.text-sm",
              {
                type: "button",
                afterCreate: (el) =>
                  this.handleAfterCreate(el, "click", "handleDelete"),
                afterRemoved: (el) =>
                  this.handleAfterRemoved(el, "click", "handleDelete"),
              },
              ["Delete"]
            )
          : null,
        ["create", "edit"].indexOf(this.mode) !== -1
          ? h(
              "button.btn-save.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold.text-sm",
              { type: "submit" },
              ["Save"]
            )
          : null,
      ]),
    ]);
  }

  renderBaseDeviceSettings() {
    if (this.view !== "form") return null;

    return [
      h("div.mb-4", [
        h("label.text-gray-700.mb-2.block", { for: "name" }, ["Name:"]),
        h(
          "input.bg-gray-100.appearance-none.border-2.border-gray-100.rounded.w-full.py-2.px-4.text-gray-700.leading-tight.focus:outline-none.focus:bg-white.focus:border-blue-500",
          {
            type: "text",
            name: "name",
            required: true,
            maxlength: 200,
            placeholder: "Enter a name",
            value: this.device.name,
            disabled: this.mode === "view",
            afterCreate: (el) =>
              this.handleAfterCreate(el, "keyup", "handleNameChange"),
            afterRemoved: (el) =>
              this.handleAfterRemoved(el, "keyup", "handleNameChange"),
          }
        ),
      ]),
      h("div.mb-4", [
        h("label.text-gray-700.mb-2.block", { for: "deviceTypeId" }, ["Type:"]),
        h(
          "select.ddl-type.bg-gray-100.appearance-none.border-2.border-gray-100.rounded.w-full.py-2.px-4.text-gray-700.leading-tight.focus:outline-none.focus:bg-white.focus:border-blue-500",
          {
            name: "deviceTypeId",
            required: true,
            value: this.device.deviceTypeId,
            disabled: ["view", "edit"].indexOf(this.mode) !== -1,
            afterCreate: (el) =>
              this.handleAfterCreate(el, "change", "handleDeviceTypeChange"),
            afterRemoved: (el) =>
              this.handleAfterRemoved(el, "change", "handleDeviceTypeChange"),
          },
          [
            h("option", { value: "" }, ["Select a device type"]),
            ...this.deviceTypes.map((type) => {
              return h("option", { value: type.id }, [type.name]);
            }),
          ]
        ),
      ]),
    ];
  }

  renderList(setting, deviceSetting) {
    if (setting.dataType !== "List") return null;

    return h("div.mb-4", { key: setting.id }, [
      h("label.text-gray-700.mb-2.block", { for: setting.id }, [
        `${setting.name}:`,
      ]),
      h(
        "select.bg-gray-100.appearance-none.border-2.border-gray-100.rounded.w-full.py-2.px-4.text-gray-700.leading-tight.focus:outline-none.focus:bg-white.focus:border-blue-500",
        {
          type: "text",
          name: setting.id,
          required: setting.required,
          value: deviceSetting ? deviceSetting.value : null,
          disabled: this.mode === "view",
        },
        setting.options
          .sort((a, b) => (a.text > b.text ? 1 : -1))
          .map((opt) => {
            return h("option", { value: opt.value }, [opt.text]);
          })
      ),
    ]);
  }

  renderTextbox(setting, deviceSetting) {
    if (setting.dataType !== "String") return null;

    return h("div.mb-4", { key: setting.id }, [
      h("label.text-gray-700.mb-2.block", { for: setting.id }, [
        `${setting.name}:`,
      ]),
      h("input", {
        type: "text",
        name: setting.id,
        required: setting.required,
        maxlength: 200,
        value: deviceSetting ? deviceSetting.value : null,
        disabled: this.mode === "view",
      }),
    ]);
  }

  renderRange(setting, deviceSetting) {
    if (setting.dataType !== "Number") return null;

    return h("div.mb-4", { key: setting.id }, [
      h("label.text-gray-700.mb-2.block", { for: setting.id }, [
        `${setting.name}:`,
      ]),
      h("ui-slider", {
        name: setting.id,
        min: setting.min,
        max: setting.max,
        step: setting.step,
        value: deviceSetting ? deviceSetting.value : null,
        disabled: this.mode === "view",
      }),
    ]);
  }

  renderCheckbox(setting, deviceSetting) {
    if (setting.dataType !== "Boolean") return null;

    return h("div.mb-4", { key: setting.id }, [
      h(
        "label.text-gray-700.inline-flex.items-center.mt-3",
        { for: setting.id },
        [
          h("ui-toggle", {
            name: setting.id,
            value: deviceSetting ? deviceSetting.value : null,
            disabled: this.mode === "view",
          }),
          h("span.ml-2.text-gray-700", [setting.name]),
        ]
      ),
    ]);
  }

  renderSettings() {
    if (!this.deviceType) return null;

    return h("div.settings.pt-4.border-t", [
      h("h3.font-bold.text-sm.uppercase.text-gray-700", ["Settings"]),
      ...this.deviceType.settings
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map((d) => {
          const deviceSetting = (this.device ? this.device.settings : []).find(
            (x) => x.deviceTypeSettingId === d.id
          );
          return (
            this.renderCheckbox(d, deviceSetting) ||
            this.renderTextbox(d, deviceSetting) ||
            this.renderRange(d, deviceSetting) ||
            this.renderList(d, deviceSetting)
          );
        }),
    ]);
  }

  renderFormView() {
    if (this.view !== "form") return null;

    return h(
      "form",
      {
        afterCreate: (el) =>
          this.handleAfterCreate(el, "submit", "handleFormSubmit"),
        afterRemoved: (el) =>
          this.handleAfterRemoved(el, "submit", "handleFormSubmit"),
      },
      [
        this.renderFormHeader(),
        ...this.renderBaseDeviceSettings(),
        this.renderSettings(),
      ]
    );
  }

  render() {
    return h("div.p-4", [
      this.renderInfoView(),
      this.renderFormView(),
      h("ui-confirm", {
        afterCreate: (el) =>
          this.handleAfterCreate(el, "choice", "handleDeleteChoice"),
        afterRemoved: (el) =>
          this.handleAfterCreate(el, "choice", "handleDeleteChoice"),
      }),
    ]);
  }
}

customElements.define("ui-device-editor", DeviceEditorComponent);
