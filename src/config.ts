import { Config } from "./index"

export const config: Config = {
  attribute: "data-css-" + Math.floor(Math.random() * 100),
  textColor: "#ebebeb",
  hooks: {
    onCSSStyleRule() {},
  },
  replaceMap: {
    ffffff: "121212",
  },
}
