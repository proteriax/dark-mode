module.exports = {
  presets: ["@babel/preset-env"],
  plugins: [
    ["@babel/plugin-transform-typescript", { allowNamespaces: true, isTSX: true }],
    "@babel/plugin-transform-runtime",
  ],
}
