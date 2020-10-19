import { darkMode, isDarkMode } from "./util"
import { applyExternals, recordExternalColors } from "./externals"
import { applyInline } from "./inline"
import { appendNodes } from "./nodes"

export const config = {
  attribute: "data-css-" + Math.floor(Math.random() * 100),
  textColor: "#ebebeb",
  hooks: {
    /** Returns false to stop processing this rule */
    onCSSStyleRule(style: CSSStyleRule): void | false {},
  },
  replaceMap: {
    ffffff: "121212",
  },
}

export type Config = typeof config

// eslint-disable-next-line @typescript-eslint/no-extra-semi
export async function start(configs: Partial<Config>) {
  Object.assign(config, configs)
  appendNodes()
  applyInline()

  if (isDarkMode()) {
    recordExternalColors(true)

    darkMode.addEventListener("change", e => {
      applyExternals(e.matches)
    })

    new MutationObserver(() => {
      applyInline()
      recordExternalColors(isDarkMode())
    }).observe(document.head, {
      childList: true,
      subtree: false,
    })
  }
}
