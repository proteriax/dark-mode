module.exports = {
  plugins: [
    ["@babel/plugin-transform-typescript", { allowNamespaces: true, isTSX: true }],
    "babel-plugin-macros",
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["@babel/plugin-proposal-nullish-coalescing-operator", { loose: true }],
    ["@babel/plugin-proposal-optional-chaining", { loose: true }],
    ["@babel/plugin-proposal-private-methods", { loose: true }],
    "@babel/plugin-proposal-logical-assignment-operators",
    "@babel/plugin-proposal-optional-catch-binding",
    "@babel/plugin-proposal-numeric-separator",
    "@babel/plugin-transform-runtime",
  ],
}
