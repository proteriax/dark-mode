/* eslint-disable class-methods-use-this */
/**
 * csstools/css-typed-om
 * @author Jonathan Neal <jonathantneal@hotmail.com>
 * @repo https://github.com/csstools/css-typed-om
 * @version 0.4.0
 */
class CSSKeywordValue {
  #value: string

  get value() {
    return this.#value
  }
  set value(newValue: string) {
    this.#value = String(newValue)
  }
  toString() {
    return `${this.value}`
  }
  constructor(value: string) {
    assertArgumentLength(arguments.length, 1, "construct 'CSSKeywordValue'")
    this.#value = String(value)
  }
}

Object.defineProperties(CSSKeywordValue.prototype, {
  value: {
    enumerable: true,
  },
})

class CSSMathInvert {
  #value: CSSNumericValue

  constructor(value: CSSNumericValue) {
    this.#value = value
  }
  get operator() {
    return "invert"
  }
  get value() {
    return this.#value
  }
  toString() {
    return `calc(1 / ${this.#value})`
  }
}

class CSSMathMax {
  #value: CSSNumericValue[]

  constructor(...values: CSSNumericValue[]) {
    this.#value = values
  }
  get operator() {
    return "max"
  }
  get values() {
    return this.#value
  }
  toString() {
    return `max(${this.#value!.join(", ")})`
  }
}

class CSSMathMin {
  #value: CSSNumericValue[]

  constructor(...values: CSSNumericValue[]) {
    this.#value = values
  }
  get operator() {
    return "min"
  }
  get values() {
    return this.#value
  }
  toString() {
    return `min(${this.#value!.join(", ")})`
  }
}

class CSSMathProduct {
  #value: (CSSNumericValue | CSSMathInvert)[]

  constructor(...values: (CSSNumericValue | CSSMathInvert)[]) {
    this.#value = values
  }
  get operator() {
    return "product"
  }
  get values() {
    return this.#value
  }
  toString() {
    return (
      "calc" +
      this.#value.reduce(
        (accum, value) =>
          value instanceof CSSMathInvert
            ? `${accum ? `${accum} / ` : "1 / "}${value.value}`
            : `${accum ? `${accum} * ` : ""}${value}`,
        ""
      ) +
      ")"
    )
  }
}

class CSSMathSum {
  #value: CSSNumericValue[]

  constructor(...values: CSSNumericValue[]) {
    this.#value = values
  }
  get operator() {
    return "product"
  }
  get values() {
    return this.#value
  }
  toString() {
    return `calc(${this.#value.reduce(
      (accum, value) => `${accum ? `${accum} + ` : ""}${value}`,
      ""
    )})`
  }
}

class CSSStyleValue {
  constructor() {
    throw TypeError("Illegal constructor")
  }
}

const units = {
  __proto__: null,
  number: "",
  percent: "%",
  em: "em",
  ex: "ex",
  ch: "ch",
  rem: "rem",
  vw: "vw",
  vh: "vh",
  vmin: "vmin",
  vmax: "vmax",
  cm: "cm",
  mm: "mm",
  in: "in",
  pt: "pt",
  pc: "pc",
  px: "px",
  Q: "Q",
  deg: "deg",
  grad: "grad",
  rad: "rad",
  turn: "turn",
  s: "s",
  ms: "ms",
  Hz: "Hz",
  kHz: "kHz",
  dpi: "dpi",
  dpcm: "dpcm",
  dppx: "dppx",
  fr: "fr",
} as const

type CSSNumericValueConstructor = new (value: number, unit: string) => CSSNumericValue

abstract class CSSNumericValue {
  abstract value: number
  abstract unit: string

  add(...args) {
    const Constructor = this.constructor as CSSNumericValueConstructor
    const result = new Constructor(this.value, this.unit)
    const values: any[] = []

    for (const arg of args) {
      if (arg instanceof Constructor) {
        if (values.length || result.unit !== arg.unit) {
          values.push(arg)
        } else {
          result.value += arg.value
        }
      } else if (
        arg instanceof CSSMathProduct ||
        arg instanceof CSSMathMax ||
        arg instanceof CSSMathMin ||
        arg instanceof CSSMathInvert
      ) {
        values.push(arg)
      } else {
        return null
      }
    }

    return values.length ? new CSSMathSum(result, ...values) : result
  }

  div(...args) {
    const Constructor = this.constructor as CSSNumericValueConstructor
    const result = new Constructor(this.value, this.unit)
    const values: CSSNumericValue[] = []

    for (let arg of args) {
      if (typeof arg === "number") {
        arg = new CSSUnitValue(arg, "number")
      }

      if (arg instanceof Constructor) {
        if (values.length || (result.unit !== arg.unit && arg.unit !== "number")) {
          values.push(arg)
        } else {
          result.value /= arg.value
        }
      } else {
        return null
      }
    }

    return values.length
      ? new CSSMathProduct(result, ...values.map(value => new CSSMathInvert(value)))
      : result
  }

  max(...args) {
    const result = new CSSUnitValue(this.value, this.unit)
    const values = [result]

    for (const arg of args) {
      if (arg instanceof CSSUnitValue) {
        if (values.length > 1 || result.unit !== arg.unit) {
          values.push(arg)
        } else {
          result.value = Math.max(result.value, arg.value)
        }
      } else {
        return null
      }
    }

    return values.length > 1 ? new CSSMathMax(...values) : result
  }

  min(...args) {
    const result = new CSSUnitValue(this.value, this.unit)
    const values = [result]

    for (const arg of args) {
      if (arg instanceof CSSUnitValue) {
        if (values.length > 1 || result.unit !== arg.unit) {
          values.push(arg)
        } else {
          result.value = Math.min(result.value, arg.value)
        }
      } else {
        return null
      }
    }

    return values.length > 1 ? new CSSMathMin(...values) : result
  }

  mul(...args) {
    const Constructor = this.constructor as CSSNumericValueConstructor
    const result = new Constructor(this.value, this.unit)
    const values: CSSNumericValue[] = []

    for (let arg of args) {
      if (typeof arg === "number") {
        arg = new CSSUnitValue(arg, "number")
      }

      if (arg instanceof Constructor) {
        if (values.length || (result.unit !== arg.unit && arg.unit !== "number")) {
          values.push(arg)
        } else {
          result.value *= arg.value
        }
      } else {
        return null
      }
    }

    return values.length ? new CSSMathProduct(result, ...values) : result
  }

  sub(...args) {
    const Constructor = this.constructor as CSSNumericValueConstructor
    const result = new Constructor(this.value, this.unit)
    const values: CSSNumericValue[] = []

    for (const arg of args) {
      if (arg instanceof Constructor) {
        if (values.length || result.unit !== arg.unit) {
          values.push(new Constructor(arg.value * -1, arg.unit))
        } else {
          result.value -= arg.value
        }
      } else {
        return null
      }
    }

    return values.length ? new CSSMathSum(result, ...values) : result
  }
}

class CSSUnitValue extends CSSNumericValue {
  #value: number
  #unit: string

  get value() {
    return this.#value
  }
  set value(newValue) {
    this.#value = getFiniteNumber(newValue!)
  }
  get unit() {
    return this.#unit
  }
  toString() {
    return `${this.value}${units[this.unit]}`
  }

  constructor(value: number, unit: string) {
    super()
    assertArgumentLength(arguments.length, 2, "construct 'CSSUnitValue'")

    this.#value = getFiniteNumber(value)
    this.#unit = getUnit(unit)
  }
}

Object.defineProperties(CSSUnitValue.prototype, {
  value: {
    enumerable: true,
  },
  unit: {
    enumerable: true,
  },
})

function getFiniteNumber(value: number) {
  if (isNaN(value) || Math.abs(value) === Infinity) {
    throw TypeError(
      `Failed to set the 'value' property on 'CSSUnitValue': The provided double value is non-finite.`
    )
  }

  return Number(value)
}

function getUnit(unit: string) {
  if (!Object.keys(units).includes(unit)) {
    throw TypeError(`Failed to construct 'CSSUnitValue': Invalid unit: ${unit}`)
  }

  return unit
}

const parseAsValue = (string: string) => {
  const unitParsingMatch = String(string).match(unitParsingMatcher)

  if (unitParsingMatch) {
    const [, value, unit = ""] = unitParsingMatch as any[]
    return new CSSUnitValue(value, unitKeys[unitValues.indexOf(unit)])
  }

  return new CSSKeywordValue(string)
}

const unitKeys = Object.keys(units)
const unitValues = Object.values(units)
const unitParsingMatcher = RegExp(`^([-+]?[0-9]*.?[0-9]+)(${unitValues.join("|")})?$`)

const unimplemented = "Unimplemented"

abstract class StylePropertyMap {
  style: CSSStyleDeclaration

  constructor() {
    throw TypeError("Illegal constructor")
  }

  get(property: string) {
    assertArgumentLength(arguments.length, 1, "'get' on 'StylePropertyMapReadOnly'")
    const value = this.style.getPropertyValue(property)

    if (value) {
      return parseAsValue(value)
    }

    return null
  }

  append() {
    throw unimplemented
  }
  clear() {
    const { style } = this
    while (style.length) {
      const item = style.item(0)
      style.removeProperty(item)
    }
  }
  delete(key: string) {
    this.style.removeProperty(key)
  }
  has(key: string) {
    return !!this.style[key]
  }
  get size() {
    return this.style.length
  }

  set(property: string, value: string) {
    assertArgumentLength(arguments.length, 2, "'set' on 'StylePropertyMap'")
    this.style.setProperty(property, String(value))
  }
}

function assertArgumentLength(length: number, minimum: number, name: string) {
  if (length < minimum) {
    throw TypeError(
      `Failed to ${name}: ${minimum} arguments required, but only ${length} present.`
    )
  }
}

function defaults(target: object, source: object) {
  for (const key of Object.keys(source)) {
    if (!target[key]) {
      target[key] = source[key]
    }
  }
}

export function polyfill(window: Window) {
  const global: any = window
  defaults(global, {
    CSS: class CSS {},
  })

  Object.keys(units).forEach(unit => {
    defaults(global.CSS, {
      [unit]: (value: number) => new CSSUnitValue(value, unit),
    })
  })

  defineProperty(global.CSSRule, "styleMap", context => context.style)
  defineProperty(global.Element, "attributeStyleMap", context => context.style)
  defineProperty(global.Element, "computedStyleMap", context => getComputedStyle(context))

  defaults(global, {
    CSSKeywordValue,
    CSSMathInvert,
    CSSMathMax,
    CSSMathMin,
    CSSMathProduct,
    CSSMathSum,
    CSSStyleValue,
    CSSUnitValue,
    StylePropertyMap,
  })

  function defineProperty<T = any>(
    Class: { new (...args: any[]): T },
    property: string,
    getStyle: (context: T) => CSSStyleDeclaration
  ) {
    if (!(property in Class.prototype)) {
      Object.defineProperty(Class.prototype, property, {
        configurable: true,
        enumerable: true,

        get() {
          const computedStyleMap = Object.create(StylePropertyMap.prototype)
          computedStyleMap.style = getStyle(this)
          return computedStyleMap
        },
      })
    }
  }
}
