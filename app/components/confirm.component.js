import { h } from "maquette";
import { BaseComponent } from "./base-component";

export class ConfirmComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });
  }

  get message() {
    return this.getAttribute("message");
  }

  set message(value) {
    this.setAttribute("message", value);
    this.projector.renderNow();
  }

  get modal() {
    return this.node.querySelector("div.modal");
  }

  get btnContinue() {
    return this.node.querySelector("button.btn-continue");
  }

  get btnCancel() {
    return this.node.querySelector("button.btn-cancel");
  }

  connectedCallback() {
    super.connectedCallback();

    this.btnCancel.addEventListener("click", () => {
      this.close();
      this.raiseChoiceEvent(false);
    });

    this.btnContinue.addEventListener("click", () => {
      this.close();
      this.raiseChoiceEvent(true);
    });
  }

  open() {
    this.modal.classList.remove("hidden");
  }

  close() {
    this.modal.classList.add("hidden");
  }

  raiseChoiceEvent(choice) {
    const event = new CustomEvent("choice", { detail: choice });
    this.dispatchEvent(event);
  }

  render() {
    return h(
      "div.modal.fixed.inset-0.z-10.bg-gray-500.bg-opacity-75.flex.justify-center.items-center.hidden",
      [
        h("div.bg-white.shadow-xl.sm:rounded.w-full.sm:w-3/4", [
          h("div.p-4", [
            h("div.flex.items-center", [
              h(
                "div.rounded-full.bg-red-100.h-10.w-10.flex.items-center.justify-center",
                [
                  h(
                    "i.fas.fa-exclamation-triangle.text-xl.opacity-75.text-red-500"
                  ),
                ]
              ),
              h("h3.ml-4.text-lg.leading-6.font-medium.text-gray-900", [
                "Delete device",
              ]),
            ]),
            h("p.ml-14.my-4", [this.message]),
          ]),
          h("div.p-4.rounded-b.bg-gray-100.text-right", [
            h(
              "button.btn-cancel.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-gray-400.hover:bg-gray-500.outline-none.focus:border-gray-900.font-semibold.text-sm",
              { type: "button" },
              ["Cancel"]
            ),
            h(
              "button.btn-continue.m-1.sm:m-0.sm:ml-4.rounded.text-white.py-2.px-5.no-underline.hover:no-underline.shadow.bg-blue-400.hover:bg-blue-500.outline-none.focus:border-blue-900.font-semibold.text-sm",
              { type: "button" },
              ["Continue"]
            ),
          ]),
        ]),
      ]
    );
  }
}

customElements.define("ui-confirm", ConfirmComponent);
