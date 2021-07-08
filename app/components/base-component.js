import { h, createProjector } from "maquette";

export class BaseComponent extends HTMLElement {
  constructor({ useShadowDom, shadowDomMode }) {
    super();

    if (useShadowDom) {
      this.shadow = this.attachShadow({ mode: shadowDomMode });
    }

    this.projector = createProjector();
  }

  connectedCallback() {
    this.projector.append(this.node, this.render.bind(this));
  }

  render() {
    return h("div", []);
  }

  get node() {
    return this.shadow || this;
  }
}
