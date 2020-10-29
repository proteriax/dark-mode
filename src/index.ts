import { darkMode, isDarkMode } from "./util"
import { applyExternals, recordExternalColors } from "./externals"
import { applyInline } from "./inline"
import { appendNodes } from "./nodes"
import { config } from "./config"

export interface Config {
  /** Attribute name for targeting inline style attributes */
  attribute: string
  /** Base text color. It can be a CSS variable. */
  textColor: string
  hooks: {
    /** Returns false to stop processing this rule */
    onCSSStyleRule(style: CSSStyleRule): void | false
    /** Color filter. Return false to skip the node */
    shouldApplyTextColor(node: HTMLElement): boolean
    /** Background filter. Return false to skip the node */
    shouldApplyBackground(node: HTMLElement): boolean
  }
  /** Special cases for these colors. */
  replaceMap: Record<string, string>
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi
export async function start(configs: Partial<Config>) {
  Object.assign(config, configs)
  appendNodes()
  applyInline(config)

  if (isDarkMode()) {
    recordExternalColors(true)

    darkMode.addEventListener("change", e => {
      applyExternals(e.matches)
    })

    new MutationObserver(() => {
      applyInline(config)
      recordExternalColors(isDarkMode())
    }).observe(document.head, {
      childList: true,
      subtree: false,
    })
  }
}
