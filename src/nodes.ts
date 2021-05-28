import { config } from "./config"
import { darkModeMedia } from "./util"
import { strongMemoize, weakMemoize } from "./util"

let external: Style
let inline: Style

const processed = "data-processed"

export function appendNodes() {
  external = document.createElement("style")
  external.media = darkModeMedia
  external.setAttribute(processed, "true")
  inline = external.cloneNode() as Style
  document.documentElement.append(external, inline)
}

let counter = 1
const getIndex = weakMemoize<Node, number>(() => counter++)

const validNodeID = /^[A-Z0-9_-]$/i

export type CSSRuleChild = CSSRule | CSSStyleRule | CSSMediaRule

export const processedRules = new WeakSet<CSSRuleChild>()

const attachSelector = weakMemoize((node: Element) => {
  const prefix = node.id && validNodeID.test(node.id) ? `#${node.id}` : ""
  const index = getIndex(node)
  node.setAttribute(config.attribute, index as any)
  return prefix + `[${config.attribute}="${index}"]`
})

export const getStyleRule = weakMemoize((el: Element) => {
  const index = inline.sheet!.insertRule(attachSelector(el) + "{}")
  const rule = inline.sheet!.cssRules.item(index) as CSSStyleRule
  processedRules.add(rule)
  return rule
})

export const getExternalStyleRule = strongMemoize((selector: string) => {
  const index = external.sheet!.insertRule(selector + "{}")
  const rule = external.sheet!.cssRules.item(index) as CSSStyleRule
  processedRules.add(rule)
  return rule
})
