// SASS Color ported to TypeScript.
// dart-sass copyright:
//   Copyright 2016 Google Inc. Use of this source code is governed by an
//   MIT-style license that can be found in the LICENSE file or at
//   https://opensource.org/licenses/MIT.
// Upstream: 20978e0
import invariant from "tiny-invariant"

type ColorRGB = { red: number; green: number; blue: number }
type ColorHSL = { hue: number; saturation: number; lightness: number }
type ColorLAB = { lightness: number; a: number; b: number }

const { pow, floor, ceil, max, min } = Math
const NOOP = Symbol()

export class Color {
  #rgb: Readonly<ColorRGB>
  #hsl: Readonly<ColorHSL>
  #lab: Readonly<ColorLAB>

  get rgb() {
    if (this.#rgb == null) this._hslToRgb()
    return this.#rgb
  }

  get hsl() {
    if (this.#hsl == null) this._rgbToHsl()
    return this.#hsl
  }

  get lab() {
    if (this.#lab == null) this._rgbToLab()
    return this.#lab
  }

  public alpha: number

  // Alias the most commonly used properties
  get red() {
    return this.rgb.red
  }
  get green() {
    return this.rgb.green
  }
  get blue() {
    return this.rgb.blue
  }

  constructor(
    values: (ColorRGB | ColorHSL | ColorLAB) & { alpha?: number },
    noop?: symbol
  ) {
    if (noop === NOOP) return

    const { alpha } = values
    this.alpha = alpha == null ? 1 : fuzzyAssertRange(alpha, 0, 1, "alpha")

    if ("red" in values) {
      this.#rgb = {
        red: values.red,
        green: values.green,
        blue: values.blue,
      }
      checkValueInInterval(values.red, 0, 255, "red")
      checkValueInInterval(values.green, 0, 255, "green")
      checkValueInInterval(values.blue, 0, 255, "blue")
    } else if ("hue" in values) {
      this.#hsl = {
        hue: values.hue % 360,
        saturation: fuzzyAssertRange(values.saturation, 0, 100, "saturation"),
        lightness: fuzzyAssertRange(values.lightness, 0, 100, "lightness"),
      }
    } else {
      this.#lab = {
        lightness: values.lightness,
        a: values.a,
        b: values.b,
      }
      this._labToRGB()
    }
  }

  static rgba(red: number, green: number, blue: number, alpha?: number): Color {
    return new Color({ red, green, blue, alpha })
  }

  static parse(source: string) {
    if (/^rgba?\(/.test(source)) {
      const [red, green, blue, alpha] = source
        .slice(source.startsWith("rgba") ? 5 : 4, -1)
        .split(", ")
        .map(x => parseFloat(x))
      return Color.rgba(red, green, blue, alpha)
    } else if (source[0] === "#") {
      return Color.parseHex(source)
    } else if (source in literals) {
      return Color.parseHex("#" + literals[source])
    }
  }

  static parseHex(source: string) {
    invariant(source[0] === "#", "Invalid hex")
    const { length } = source
    if (length === 4 || length === 5) {
      return Color.rgba(
        parseHex(source[1] + source[1])!,
        parseHex(source[2] + source[2])!,
        parseHex(source[3] + source[3])!,
        parseHex(source[4] + source[4])
      )
    } else if (length === 7 || length === 9) {
      const [r, g, b, a] = parseRGBHex(source)
      return Color.rgba(r, g, b, a)
    } else {
      throw TypeError()
    }
  }

  static parseSafe(source: string) {
    try {
      return Color.parse(source)
    } catch {}
  }

  map<R>(fn: (value: Color) => R) {
    return fn(this)
  }

  fuzzyMatchRGB(red: number, green: number, blue: number) {
    return (
      fuzzyEquals(this.red, red) &&
      fuzzyEquals(this.green, green) &&
      fuzzyEquals(this.blue, blue)
    )
  }

  fuzzyMatchHex(hex: string, margin: number) {
    const [red, green, blue] = parseRGBHex(hex)
    return (
      fuzzyEquals(this.red, red, margin) &&
      fuzzyEquals(this.green, green, margin) &&
      fuzzyEquals(this.blue, blue, margin)
    )
  }

  private changeRgb(
    red = this.red,
    green = this.green,
    blue = this.blue,
    alpha = this.alpha
  ): Color {
    return Color.rgba(red, green, blue, alpha)
  }

  private changeHSL(key: keyof ColorHSL, value: (original: number) => number): Color {
    return new Color({
      ...this.hsl,
      [key]: value(this.hsl[key]),
      alpha: this.alpha,
    })
  }

  changeLAB(key: keyof ColorLAB, value: (original: number) => number): Color {
    return new Color({
      ...this.lab,
      [key]: value(this.lab[key]),
      alpha: this.alpha,
    })
  }

  private changeAlpha(alpha: number): Color {
    const color = new Color(null as any, NOOP)
    color.#rgb = { ...this.#rgb }
    color.#hsl = { ...this.#hsl }
    color.#lab = { ...this.#lab }
    color.alpha = fuzzyAssertRange(alpha, 0, 1, "alpha")
    return color
  }

  equals(other: any) {
    return (
      other instanceof Color &&
      other.red === this.red &&
      other.green === this.green &&
      other.blue === this.blue &&
      other.alpha === this.alpha
    )
  }

  /**
   * Computes `_hue`, `_saturation`, and `_value` based on `red`, `green`, and
   * `blue`.
   */
  private _rgbToHsl(): void {
    // Algorithm from https://en.wikipedia.org/wiki/HSL_and_HSV#RGB_to_HSL_and_HSV
    const scaledRed = this.red / 255
    const scaledGreen = this.green / 255
    const scaledBlue = this.blue / 255

    const $max = max(max(scaledRed, scaledGreen), scaledBlue)
    const $min = min(min(scaledRed, scaledGreen), scaledBlue)
    const delta = $max - $min

    this.#hsl = {} as any
    const hsl = this.#hsl as ColorHSL

    if ($max === $min) {
      hsl.hue = 0
    } else if ($max === scaledRed) {
      hsl.hue = ((60 * (scaledGreen - scaledBlue)) / delta) % 360
    } else if ($max === scaledGreen) {
      hsl.hue = (120 + (60 * (scaledBlue - scaledRed)) / delta) % 360
    } else if ($max === scaledBlue) {
      hsl.hue = (240 + (60 * (scaledRed - scaledGreen)) / delta) % 360
    }

    hsl.lightness = 50 * ($max + $min)

    if ($max === $min) {
      hsl.saturation = 0
    } else if (hsl.lightness < 50) {
      hsl.saturation = (100 * delta) / ($max + $min)
    } else {
      hsl.saturation = (100 * delta) / (2 - $max - $min)
    }
  }

  // Algorithm from https://observablehq.com/@mbostock/lab-and-rgb
  private _rgbToLab(): void {
    // 1. Convert to linear-light sRGB.
    const r = rgbToLRGB(this.red)
    const g = rgbToLRGB(this.green)
    const b = rgbToLRGB(this.blue)

    // 2. Convert and apply chromatic adaptation to CIEXYZ D50.
    const x = 0.4360747 * r + 0.3850649 * g + 0.1430804 * b
    const y = 0.2225045 * r + 0.7168786 * g + 0.0606169 * b
    const z = 0.0139322 * r + 0.0971045 * g + 0.7141733 * b

    // 3. Convert from CIEXYZ D50 to CIELAB
    const fx = f(x / 0.96422)
    const fy = f(y)
    const fz = f(z / 0.82521)

    this.#lab = {
      lightness: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
    }
  }

  /**
   * Computes `_red`, `_green`, and `_blue` based on `hue`, `saturation`, and
   * `value`.
   */
  private _hslToRgb(): void {
    // Algorithm from the CSS3 spec: https://www.w3.org/TR/css3-color/#hsl-color.
    const { hue, saturation, lightness } = this.hsl
    const scaledHue = hue / 360
    const scaledSaturation = saturation / 100
    const scaledLightness = lightness / 100

    const m2 =
      scaledLightness <= 0.5
        ? scaledLightness * (scaledSaturation + 1)
        : scaledLightness + scaledSaturation - scaledLightness * scaledSaturation
    const m1 = scaledLightness * 2 - m2
    this.#rgb = {
      red: hueToRGB(m1, m2, scaledHue + 1 / 3),
      green: hueToRGB(m1, m2, scaledHue),
      blue: hueToRGB(m1, m2, scaledHue - 1 / 3),
    }
  }

  // Algorithm from https://observablehq.com/@mbostock/lab-and-rgb
  private _labToRGB() {
    const lab = this.#lab
    // 1. Convert from CIELAB to CIEXYZ D50
    const dl = (lab.lightness + 16) / 116
    const da = lab.a / 500
    const db = lab.b / 200

    const x = 0.96422 * f1(dl + da)
    const y = f1(dl)
    const z = 0.82521 * f1(dl - db)

    // 2. Convert to linear-light sRGB.
    const r = 3.1338561 * x - 1.6168667 * y - 0.4906146 * z
    const g = -0.9787684 * x + 1.9161415 * y + 0.033454 * z
    const b = 0.0719453 * x - 0.2289914 * y + 1.4052427 * z

    // 3. Convert to sRGB
    this.#rgb = {
      red: lrgbToRGB(r),
      green: lrgbToRGB(g),
      blue: lrgbToRGB(b),
    }
  }

  private isOpaque() {
    return fuzzyEquals(this.alpha, 1)
  }

  /**
   * Returns an `rgb()` or `rgba()` function call that will evaluate to this
   * color.
   */
  toStringAsRgb(): string {
    const isOpaque = this.isOpaque()
    let buffer = (isOpaque ? "rgb" : "rgba") + `(${this.red}, ${this.green}, ${this.blue}`

    if (!isOpaque) {
      buffer += `, ${this.alpha}`
    }

    buffer += ")"
    return buffer
  }

  /**
   * Returns an `#AABBCC` that will evaluate to this color.
   */
  toStringAsHex(): string {
    return (
      "#" +
      toHex(this.red) +
      toHex(this.green) +
      toHex(this.blue) +
      (this.isOpaque() ? "" : toHex(this.alpha * 255))
    )
  }

  // aa18e65
  invert(weight = 1) {
    const inverse = this.changeRgb(255 - this.red, 255 - this.green, 255 - this.blue)
    return _mixColors(inverse, this, weight)
  }

  grayscale() {
    return this.changeHSL("saturation", () => 0)
  }

  adjustHue(degrees: number) {
    return this.changeHSL("hue", hue => hue + degrees)
  }

  lighten(amount: number) {
    return this.darken(-amount)
  }

  darken(amount: number) {
    return this.changeHSL("lightness", lightness =>
      clamp(lightness - fuzzyAssertRange(amount, -100, 100, "amount"))
    )
  }

  saturate(amount: number) {
    return this.changeHSL("saturation", saturation =>
      clamp(saturation + fuzzyAssertRange(amount, -100, 100, "amount"))
    )
  }

  desaturate(amount: number) {
    return this.saturate(-amount)
  }

  // private extension
  private _brightness: number

  /**
   * Returns the perceived brightness of the color, from 0-255.
   */
  get brightness() {
    if (this._brightness == null) {
      // http://www.w3.org/TR/AERT#color-contrast
      this._brightness = (this.red * 299 + this.green * 587 + this.blue * 114) / 1000
    }
    return this._brightness
  }

  // function("opacify", "$color, $amount", _opacify),
  // function("fade-in", "$color, $amount", _opacify),
  // function("transparentize", "$color, $amount", _transparentize),
  // function("fade-out", "$color, $amount", _transparentize),
  // adjust.withName("adjust-color"),
  // scale.withName("scale-color"),
  // change.withName("change-color")
}

// HSL helper functions

/**
 * An algorithm from the CSS3 spec:
 * http://www.w3.org/TR/css3-color/#hsl-color.
 */
function hueToRGB(m1: number, m2: number, hue: number): number {
  if (hue < 0) hue += 1
  if (hue > 1) hue -= 1

  let result: number
  if (hue < 1 / 6) {
    result = m1 + (m2 - m1) * hue * 6
  } else if (hue < 1 / 2) {
    result = m2
  } else if (hue < 2 / 3) {
    result = m1 + (m2 - m1) * (2 / 3 - hue) * 6
  } else {
    result = m1
  }

  return fuzzyRound(result * 255)
}

// LAB helper functions
const rgbToLRGB = (x: number) => {
  x /= 255
  return x > 0.04045 ? pow((x + 0.055) / 1.055, 2.4) : x / 12.92
}

const lrgbToRGB = (x: number) => {
  x = x > 0.0031308 ? 1.055 * pow(x, 1 / 2.4) - 0.055 : 12.92 * x
  x *= 255
  return x < 0 ? 0 : x > 255 ? 255 : x
}

const delta = 6 / 29
const f = (t: number) =>
  t > pow(delta, 3) ? pow(t, 1 / 3) : t / (3 * delta * delta) + 4 / 29

const f1 = (t: number) => (t > delta ? t * t * t : pow(delta, 3) * (t - 4 / 29))

/**
 * Returns [color1] and [color2], mixed together and weighted by [weight].
 * @commit aa18e65
 */
function _mixColors(color1: Color, color2: Color, weight: number): Color {
  // This algorithm factors in both the user-provided weight (w) and the
  // difference between the alpha values of the two colors (a) to decide how
  // to perform the weighted average of the two RGB values.
  //
  // It works by first normalizing both parameters to be within [-1, 1], where
  // 1 indicates "only use color1", -1 indicates "only use color2", and all
  // values in between indicated a proportionately weighted average.
  //
  // Once we have the normalized variables w and a, we apply the formula
  // (w + a)/(1 + w*a) to get the combined weight (in [-1, 1]) of color1. This
  // formula has two especially nice properties:
  //
  //   * When either w or a are -1 or 1, the combined weight is also that
  //     number (cases where w * a == -1 are undefined, and handled as a
  //     special case).
  //
  //   * When a is 0, the combined weight is w, and vice versa.
  //
  // Finally, the weight of color1 is renormalized to be within [0, 1] and the
  // weight of color2 is given by 1 minus the weight of color1.
  const weightScale = fuzzyAssertRange(weight, 0, 100, "weight") / 100
  const normalizedWeight = weightScale * 2 - 1
  const alphaDistance = color1.alpha - color2.alpha

  const combinedWeight1 =
    normalizedWeight * alphaDistance === -1
      ? normalizedWeight
      : (normalizedWeight + alphaDistance) / (1 + normalizedWeight * alphaDistance)
  const weight1 = (combinedWeight1 + 1) / 2
  const weight2 = 1 - weight1

  const left = color1.rgb
  const right = color2.rgb

  return new Color({
    red: fuzzyRound(left.red * weight1 + right.red * weight2),
    green: fuzzyRound(left.green * weight1 + right.green * weight2),
    blue: fuzzyRound(left.blue * weight1 + right.blue * weight2),
    alpha: color1.alpha * weightScale + color2.alpha * (1 - weightScale),
  })
}

function clamp(number: number, min = 0, max = 100) {
  return number > max ? max : number < min ? min : number
}

function parseRGBHex(text: string) {
  if (text[0] === "#") text = text.slice(1)

  return [
    parseHex(text[0] + text[1])!,
    parseHex(text[2] + text[3])!,
    parseHex(text[4] + text[5])!,
    parseHex(text.slice(6)),
  ] as const
}

function parseHex(text: string) {
  const value = parseInt(text, 16)
  if (!isNaN(value)) return value
}

function toHex(num: number) {
  return (num < 16 ? "0" : "") + Math.round(num).toString(16)
}

// 1dff9a7
/**
 * The maximum distance two Sass numbers are allowed to be from one another
 * before they're considered different.
 */
const epsilon = pow(10, -11)

/**
 * Returns whether `number1` and `number2` are equal within `epsilon`.
 */
const fuzzyEquals = (number1: number, number2: number, margin = epsilon) =>
  Math.abs(number1 - number2) < margin

/** Returns whether `number1` is less than `number2`, and not `fuzzyEquals`. */
const fuzzyLessThan = (number1: number, number2: number): boolean =>
  number1 < number2 && !fuzzyEquals(number1, number2)

/** Returns whether `number1` is less than `number2`, or `fuzzyEquals`. */
const fuzzyLessThanOrEquals = (number1: number, number2: number): boolean =>
  number1 < number2 || fuzzyEquals(number1, number2)

/**
 * Rounds `number` to the nearest integer.
 *
 * This rounds up numbers that are `fuzzyEquals` to `X.5`.
 */
function fuzzyRound(number: number): number {
  // If the number is within epsilon of X.5, round up (or down for negative
  // numbers).
  if (number > 0) {
    return fuzzyLessThan(number % 1, 0.5) ? floor(number) : ceil(number)
  } else {
    return fuzzyLessThanOrEquals(number % 1, 0.5) ? floor(number) : ceil(number)
  }
}

/**
 * Returns `number` if it's within `min` and `max`, or `null` if it's not.
 *
 * If `number` is `fuzzyEquals` to `min` or `max`, it's clamped to the
 * appropriate value.
 */
function fuzzyCheckRange(number: number, min: number, max: number): number | undefined {
  if (fuzzyEquals(number, min)) return min
  if (fuzzyEquals(number, max)) return max
  if (number > min && number < max) return number
}

/**
 * Throws a `RangeError` if `number` isn't within `min` and `max`.
 *
 * If `number` is `fuzzyEquals` to `min` or `max`, it's clamped to the
 * appropriate value. `name` is used in error reporting.
 */
function fuzzyAssertRange(
  number: number,
  min: number,
  max: number,
  name?: string
): number {
  const result = fuzzyCheckRange(number, min, max)
  if (result != null) return result
  throwRangeError(number, min, max, name)
}

function throwRangeError(number: number, min: number, max: number, name?: string): never {
  throw RangeError(`${name} must be between ${min} and ${max}, received ${number}.`)
}

function checkValueInInterval(number: number, min: number, max: number, name?: string) {
  if (number < min || number > max) {
    throwRangeError(number, min, max, name)
  }
}

/**
 * key: 'real' color name
 * value: hex value ex. names["red"] --> "f00"
 */
export const literals = {
  __proto__: null,
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "0ff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "00f",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  burntsienna: "ea7e5d",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "0ff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "f0f",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "663399",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32",
}
