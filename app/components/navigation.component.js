import { h } from "maquette";
import { BaseComponent } from "./base-component";

// Based on Responsive Header Template - https://www.tailwindtoolbox.com/templates/responsive-header
export class NavigationComponent extends BaseComponent {
  constructor() {
    super({ useShadowDom: false });

    this.links = [
      { route: "/", label: "Dashboard" },
      { route: "/about", label: "About" },
    ];
  }

  get title() {
    return this.getAttribute("title") || "";
  }

  connectedCallback() {
    super.connectedCallback();

    this.node
      .querySelector(".nav-toggle")
      .addEventListener("click", this.toggle.bind(this));
  }

  toggle() {
    this.node.querySelector(".nav-content").classList.toggle("hidden");
  }

  render() {
    return h(
      "nav.flex.items-center.justify-between.flex-wrap.bg-gray-800.p-6.fixed.w-full.z-10.top-0",
      [
        h("div.flex.items-center.flex-shrink-0.text-white.mr-6", [
          h("a.text-white.no-underline.hover:text-white.hover:no-underline", [
            h("span.text-xl.pl-2", [this.title]),
          ]),
        ]),

        h("div.block.lg:hidden", [
          h(
            "button.nav-toggle.flex.items-center.px-3.py-2.border.rounded.text-gray-500.border-gray-600.hover:text-white.hover:border-white",
            [
              h(
                "svg.fill-current.h3.w3",
                {
                  viewBox: "0 0 20 20",
                  xmlns: "http://www.w3.org/2000/svg",
                  width: 20,
                  height: 20,
                },
                [
                  h("title", ["Menu"]),
                  h("path", {
                    d: "M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z",
                  }),
                ]
              ),
            ]
          ),
        ]),

        h(
          "div.nav-content.w-full.flex-grow.lg:flex.lg:items-center.lg:w-auto.hidden.lg:block.pt-6.lg:pt-0",
          [
            h("ul.list-reset.lg:flex.justify-end.flex-1.items-center", [
              this.links.map((link, index) => {
                const className =
                  link.route === window.location.pathname
                    ? ".inline-block.py-2.px-4.text-white.no-underline"
                    : ".inline-block.text-gray-600.no-underline.hover:text-gray-200.hover:text-underline.py-2.px-4";

                return h("li.mr-3", { key: index }, [
                  h(`a${className}`, { href: link.route }, [link.label]),
                ]);
              }),
            ]),
          ]
        ),
      ]
    );
  }
}

customElements.define("ui-navigation", NavigationComponent);
