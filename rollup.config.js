import pkg from "./package.json";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const input = "app/index.js";
const plugins = [nodeResolve()];

export default [
  {
    input,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
    plugins,
  },
];
