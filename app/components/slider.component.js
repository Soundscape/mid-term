import { h } from "maquette";
import { BaseComponent } from "./base-component";

export class SliderComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.dragging = false;
  }

  get disabled() {
    return ["true", "1"].indexOf(this.getAttribute("disabled")) !== -1;
  }

  set disabled(val) {
    this.setAttribute("disabled", val);
    this.projector.renderNow();
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
  }

  get min() {
    return parseFloat(this.getAttribute("min") || 0);
  }

  set min(val) {
    this.setAttribute("min", val);
  }

  get max() {
    return parseFloat(this.getAttribute("max") || 1);
  }

  set max(val) {
    this.setAttribute("max", val);
  }

  get step() {
    return parseFloat(this.getAttribute("step") || 0.1);
  }

  set step(val) {
    this.setAttribute("step", val);
  }

  get value() {
    return parseFloat(this.getAttribute("value") || 0);
  }

  set value(val) {
    this.setAttribute("value", val);
    this.projector.renderNow();
    this.raiseChangeEvent();
  }

  get bead() {
    return this.node.querySelector("span.bead");
  }

  get fill() {
    return this.node.querySelector("span.fill");
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("mouseup", this.mouseUp.bind(this));
    document.addEventListener("mousemove", this.mouseMove.bind(this));
    this.node.addEventListener("click", this.mouseClick.bind(this));
    this.node.addEventListener("mousedown", this.mouseDown.bind(this));

    if (this.value < this.min) this.value = this.min;
    if (this.value > this.max) this.value = this.max;

    const box = this.getBoundingClientRect();
    const pos = this.scaleToElement();
    this.bead.style.left = this.fill.style.width =
      Math.max(0, pos - box.x) + "px";

    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
    this.resizeObserver.observe(document.body);
  }

  scaleToElement() {
    const box = this.getBoundingClientRect();
    const minBox = box.x;
    const maxBox = box.width + box.x;
    const res =
      ((this.value - this.min) / (this.max - this.min)) * (maxBox - minBox) +
      minBox;

    return res;
  }

  updateVisuals(e) {
    const box = this.getBoundingClientRect();
    const x = e.clientX;
    this.value = Math.round(this.scaleToRange(x) / this.step) * this.step;
    if (this.value < this.min) this.value = this.min;
    if (this.value > this.max) this.value = this.max;
    const pos = this.scaleToElement(this.value);
    this.bead.style.left = this.fill.style.width =
      Math.max(0, pos - box.x) + "px";
  }

  scaleToRange(pos) {
    const box = this.getBoundingClientRect();
    const minBox = box.x;
    const maxBox = box.width + box.x;
    const res =
      ((pos - minBox) / (maxBox - minBox)) * (this.max - this.min) + this.min;

    return res;
  }

  resize() {
    const box = this.getBoundingClientRect();
    const pos = this.scaleToElement();
    this.bead.style.left = this.fill.style.width =
      Math.max(0, pos - box.x) + "px";
  }

  getDisplayValue() {
    const isFloat = Number(this.value) === this.value && this.value % 1 !== 0;

    return (isFloat ? this.value.toFixed(2) : this.value).toString();
  }

  raiseChangeEvent() {
    const event = new CustomEvent("change", { detail: this.value });
    this.dispatchEvent(event);
  }

  pauseEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  mouseDown(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    this.dragging = true;
  }

  mouseUp(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    this.dragging = false;
  }

  mouseMove(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    if (!this.dragging) return;
    this.updateVisuals(e);
  }

  mouseClick(e) {
    this.pauseEvent(e);
    if (this.disabled) return;
    this.updateVisuals(e);
  }

  render() {
    return h("div.w-full", [
      h("div.bg-gray-400.h-2.w-full.rounded-full.relative", [
        h(
          `span.bead.bg-gray-100.h-4.w-4.absolute.top-0.-ml-2.-mt-1.z-10.shadow.rounded-full${
            this.disabled ? "" : ".cursor-pointer"
          }`
        ),
        h(
          `span.fill.bg-${
            this.disabled ? "gray" : "blue"
          }-500.h-2.absolute.left-0.top-0.rounded-full.w-0`
        ),
      ]),
      h("div.flex.justify-between.mt-2.text-xs.text-gray-600", [
        h("span.w-8.text-left", [this.min.toString()]),
        h(
          "span.w-8.text-center.text-lg.text-blue-500.font-bold.whitespace-no-wrap",
          [this.getDisplayValue()]
        ),
        h("span.w-8.text-right", [this.max.toString()]),
      ]),
    ]);
  }
}

customElements.define("ui-slider", SliderComponent);
