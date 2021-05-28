import { DarkModeConfig } from "./index"

export const config: DarkModeConfig = {
  attribute: "data-css-" + Math.floor(Math.random() * 100),
  textColor: "#ebebeb",
  hooks: {},
  replaceMap: {
    ffffff: "121212",
  },
}
