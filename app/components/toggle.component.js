import { h } from "maquette";
import { BaseComponent } from "./base-component";

export class ToggleComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
    this.projector.renderNow();
  }

  get value() {
    const val = this.getAttribute("value");
    return val === "true" || val === "1";
  }

  set value(val) {
    this.setAttribute("value", val);
    this.projector.renderNow();
    this.raiseChangeEvent();
  }

  get disabled() {
    return ["true", "1"].indexOf(this.getAttribute("disabled")) !== -1;
  }

  set disabled(val) {
    this.setAttribute("disabled", val);
    this.projector.renderNow();
  }

  connectedCallback() {
    super.connectedCallback();

    this.checkbox = this.node.querySelector(
      'input[type="checkbox"].toggle-checkbox'
    );

    if (!this.disabled)
      this.checkbox.addEventListener("change", this.handleChange.bind(this));
  }

  handleChange(e) {
    e.stopPropagation();
    e.preventDefault();

    this.value = this.checkbox.checked;
  }

  raiseChangeEvent() {
    const event = new CustomEvent("change", { detail: this.value });
    this.dispatchEvent(event);
  }

  render() {
    return h(
      "div.select-none.relative.inline-block.w-10.mr-2.align-middle.transition.duration-200.ease-in",
      [
        h(
          "input.toggle-checkbox.outline-none.border-gray-400.absolute.block.w-6.h-6.rounded-full.bg-white.border-4.appearance-none.cursor-pointer",
          {
            type: "checkbox",
            checked: this.value,
            disabled: this.disabled,
          }
        ),
        h(
          "label.toggle-label.block.overflow-hidden.h-6.rounded-full.bg-gray-400.cursor-pointer"
        ),
      ]
    );
  }
}

customElements.define("ui-toggle", ToggleComponent);
