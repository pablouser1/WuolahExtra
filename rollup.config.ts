import externalGlobals from "rollup-plugin-external-globals";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
// @ts-expect-error dependency typing not configed properly
import serve from "rollup-plugin-serve";
import sass from "rollup-plugin-sass";
import type { Plugin, RollupOptions } from "rollup";
import getMetablock from "./meta";

// Map package name -> Global window name
export const EXTERNAL_GLOBALS = {
  "pdf-lib": "PDFLib",
  "jszip": "JSZip"
};

const isProduction = !process.env.ROLLUP_WATCH;

const plugins: Plugin[] = [
  getMetablock(),
  externalGlobals(EXTERNAL_GLOBALS),
  nodeResolve(),
  sass(),
  typescript(),
];

if (!isProduction) {
  plugins.push(
    serve({
      contentBase: ["dist"],
      headers: {
        "Cache-Control": "public, max-age=5",
      },
    })
  );
}

const config: RollupOptions = {
  input: "src/main.ts",
  output: {
    file: "dist/WuolahExtra.user.js",
    format: "esm",
    // Sourcemaps only for development
    sourcemap: isProduction ? false : "inline",
  },
  plugins,
};

export default config;
