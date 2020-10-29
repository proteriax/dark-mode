import * as React from "jsx-dom/min"
import { getStyleRule } from "./nodes"
import { Color, literals } from "./color"
import {
  kebabCase,
  strongMemoize,
  handleBackground,
  handleBorder,
  handleText,
} from "./util"
import type { Config } from "./index"

let temp: HTMLSpanElement

const getRealColor = strongMemoize((text: string): Color | undefined => {
  if (text.startsWith("rgb(") || text[0] === "#" || text in literals) {
    return Color.parse(text)
  }
  temp.style.color = text
  return Color.parse(getComputedStyle(temp).color)
})

export function applyInline(config: Config) {
  temp ??= (<span style={{ display: "none" }} />) as any
  document.body.appendChild(temp)

  const { hooks } = config

  const styles = [
    ...document.querySelectorAll("[style]:not([data-css])"),
  ] as HTMLElement[]

  const match = (text: string) =>
    styles.filter(node => node.getAttribute("style")!.includes(text))

  const matchStrict = (prop: string) =>
    styles.filter(node => node.attributeStyleMap.has(prop))

  matchStrict("color").forEach(node => {
    if (!node.style.color || hooks?.shouldApplyTextColor?.(node) === false) return

    const next = handleText(getRealColor(node.style.color))
    getStyleRule(node).style.setProperty("color", next, "important")
  })

  const keys: (keyof CSSStyleDeclaration)[] = [
    "borderTopColor",
    "borderLeftColor",
    "borderRightColor",
    "borderBottomColor",
  ]

  match("border").forEach(node => {
    for (const key of keys as any) {
      if (node.style[key]) {
        const next = getRealColor(node.style[key])!.map(handleBorder).toStringAsRgb()
        getStyleRule(node).style.setProperty(kebabCase(key), next, "important")
      }
    }
  })

  match("background").forEach(node => {
    if (hooks?.shouldApplyBackground?.(node) === false) return

    const key = "backgroundColor"
    const original = node.style[key]
    if (original === "transparent") return

    const color = getRealColor(original)!
    let next: Color | undefined

    if (node.textContent?.trim().length || ["TH", "TD"].includes(node.tagName)) {
      next = handleBackground(color)
    }

    if (next) {
      getStyleRule(node).style.setProperty(
        kebabCase(key),
        next.toStringAsRgb(),
        "important"
      )
    }
  })

  temp.remove()
}
