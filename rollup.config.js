// @ts-check
import babel from "@rollup/plugin-babel"
import node from "@rollup/plugin-node-resolve"
import prettier from "rollup-plugin-prettier"
import cjs from "@rollup/plugin-commonjs"
// import { terser } from "rollup-plugin-terser"
import ts from "@wessberg/rollup-plugin-ts"
import replace from "@rollup/plugin-replace"

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production"
}

const extensions = [".js", ".ts", ".mjs", ".tsx", ".json"]

/** @type {Partial<import("rollup").RollupOptions>} */
const common = {
  external: id => [/jsx-dom/, /@babel\/runtime/].some(_ => _.test(id)),
  plugins: [
    ts({
      transpileOnly: true,
    }),
    babel({
      babelrc: true,
      babelHelpers: "runtime",
      comments: false,
      extensions: extensions.slice(0, -1),
    }),
    replace({
      preventAssignment: true,
      values: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      },
    }),
    node({ extensions }),
    cjs({ extensions }),
    prettier({
      tabWidth: 2,
      parser: "babel",
      maxWidth: 140,
      semi: true,
    }),
  ].filter(Boolean),
}

/**
 * @return {import("rollup").RollupOptions[]}
 */
export default () => [
  {
    ...common,
    input: "./src/index.ts",
    output: {
      file: "./lib/index.js",
      format: "esm",
      banner: "/* eslint-disable */",
    },
  },
  {
    ...common,
    input: "./src/polyfill.ts",
    output: {
      file: "./lib/polyfill.js",
      format: "esm",
      banner: "/* eslint-disable */",
    },
  },
]
