/* eslint-disable */
import _classPrivateFieldLooseBase from "@babel/runtime/helpers/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/classPrivateFieldLooseKey";
import { createElement } from "jsx-dom/min";

var prefix = "Invariant failed";

function invariant(condition, message) {
  if (condition) {
    return;
  }

  {
    throw new Error(prefix);
  }
}

const { pow, floor, ceil, max, min } = Math;
const NOOP = Symbol();

var _rgb = _classPrivateFieldLooseKey("rgb");

var _hsl = _classPrivateFieldLooseKey("hsl");

var _lab = _classPrivateFieldLooseKey("lab");

class Color {
  constructor(values, noop) {
    Object.defineProperty(this, _rgb, {
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, _hsl, {
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, _lab, {
      writable: true,
      value: void 0,
    });
    if (noop === NOOP) return;
    const { alpha } = values;
    this.alpha = alpha == null ? 1 : fuzzyAssertRange(alpha, 0, 1, "alpha");

    if ("red" in values) {
      _classPrivateFieldLooseBase(this, _rgb)[_rgb] = {
        red: values.red,
        green: values.green,
        blue: values.blue,
      };
      checkValueInInterval(values.red, 0, 255, "red");
      checkValueInInterval(values.green, 0, 255, "green");
      checkValueInInterval(values.blue, 0, 255, "blue");
    } else if ("hue" in values) {
      _classPrivateFieldLooseBase(this, _hsl)[_hsl] = {
        hue: values.hue % 360,
        saturation: fuzzyAssertRange(values.saturation, 0, 100, "saturation"),
        lightness: fuzzyAssertRange(values.lightness, 0, 100, "lightness"),
      };
    } else {
      _classPrivateFieldLooseBase(this, _lab)[_lab] = {
        lightness: values.lightness,
        a: values.a,
        b: values.b,
      };

      this._labToRGB();
    }
  }

  get rgb() {
    if (_classPrivateFieldLooseBase(this, _rgb)[_rgb] == null) this._hslToRgb();
    return _classPrivateFieldLooseBase(this, _rgb)[_rgb];
  }

  get hsl() {
    if (_classPrivateFieldLooseBase(this, _hsl)[_hsl] == null) this._rgbToHsl();
    return _classPrivateFieldLooseBase(this, _hsl)[_hsl];
  }

  get lab() {
    if (_classPrivateFieldLooseBase(this, _lab)[_lab] == null) this._rgbToLab();
    return _classPrivateFieldLooseBase(this, _lab)[_lab];
  }

  get red() {
    return this.rgb.red;
  }

  get green() {
    return this.rgb.green;
  }

  get blue() {
    return this.rgb.blue;
  }

  static rgba(red, green, blue, alpha) {
    return new Color({
      red,
      green,
      blue,
      alpha,
    });
  }

  static parse(source) {
    if (/^rgba?\(/.test(source)) {
      const [red, green, blue, alpha] = source
        .slice(source.startsWith("rgba") ? 5 : 4, -1)
        .split(", ")
        .map(x => parseFloat(x));
      return Color.rgba(red, green, blue, alpha);
    } else if (source[0] === "#") {
      return Color.parseHex(source);
    } else if (source in literals) {
      return Color.parseHex("#" + literals[source]);
    }
  }

  static parseHex(source) {
    invariant(source[0] === "#");
    const { length } = source;

    if (length === 4 || length === 5) {
      return Color.rgba(
        parseHex(source[1] + source[1]),
        parseHex(source[2] + source[2]),
        parseHex(source[3] + source[3]),
        parseHex(source[4] + source[4])
      );
    } else if (length === 7 || length === 9) {
      const [r, g, b, a] = parseRGBHex(source);
      return Color.rgba(r, g, b, a);
    } else {
      throw TypeError();
    }
  }

  static parseSafe(source) {
    try {
      return Color.parse(source);
    } catch (_unused) {}
  }

  map(fn) {
    return fn(this);
  }

  fuzzyMatchRGB(red, green, blue) {
    return (
      fuzzyEquals(this.red, red) &&
      fuzzyEquals(this.green, green) &&
      fuzzyEquals(this.blue, blue)
    );
  }

  fuzzyMatchHex(hex, margin) {
    const [red, green, blue] = parseRGBHex(hex);
    return (
      fuzzyEquals(this.red, red, margin) &&
      fuzzyEquals(this.green, green, margin) &&
      fuzzyEquals(this.blue, blue, margin)
    );
  }

  changeRgb(red = this.red, green = this.green, blue = this.blue, alpha = this.alpha) {
    return Color.rgba(red, green, blue, alpha);
  }

  changeHSL(key, value) {
    return new Color({ ...this.hsl, [key]: value(this.hsl[key]), alpha: this.alpha });
  }

  changeLAB(key, value) {
    return new Color({ ...this.lab, [key]: value(this.lab[key]), alpha: this.alpha });
  }

  changeAlpha(alpha) {
    const color = new Color(null, NOOP);
    _classPrivateFieldLooseBase(color, _rgb)[_rgb] = {
      ..._classPrivateFieldLooseBase(this, _rgb)[_rgb],
    };
    _classPrivateFieldLooseBase(color, _hsl)[_hsl] = {
      ..._classPrivateFieldLooseBase(this, _hsl)[_hsl],
    };
    _classPrivateFieldLooseBase(color, _lab)[_lab] = {
      ..._classPrivateFieldLooseBase(this, _lab)[_lab],
    };
    color.alpha = fuzzyAssertRange(alpha, 0, 1, "alpha");
    return color;
  }

  equals(other) {
    return (
      other instanceof Color &&
      other.red === this.red &&
      other.green === this.green &&
      other.blue === this.blue &&
      other.alpha === this.alpha
    );
  }

  _rgbToHsl() {
    const scaledRed = this.red / 255;
    const scaledGreen = this.green / 255;
    const scaledBlue = this.blue / 255;
    const $max = max(max(scaledRed, scaledGreen), scaledBlue);
    const $min = min(min(scaledRed, scaledGreen), scaledBlue);
    const delta = $max - $min;
    _classPrivateFieldLooseBase(this, _hsl)[_hsl] = {};

    const hsl = _classPrivateFieldLooseBase(this, _hsl)[_hsl];

    if ($max === $min) {
      hsl.hue = 0;
    } else if ($max === scaledRed) {
      hsl.hue = ((60 * (scaledGreen - scaledBlue)) / delta) % 360;
    } else if ($max === scaledGreen) {
      hsl.hue = (120 + (60 * (scaledBlue - scaledRed)) / delta) % 360;
    } else if ($max === scaledBlue) {
      hsl.hue = (240 + (60 * (scaledRed - scaledGreen)) / delta) % 360;
    }

    hsl.lightness = 50 * ($max + $min);

    if ($max === $min) {
      hsl.saturation = 0;
    } else if (hsl.lightness < 50) {
      hsl.saturation = (100 * delta) / ($max + $min);
    } else {
      hsl.saturation = (100 * delta) / (2 - $max - $min);
    }
  }

  _rgbToLab() {
    const r = rgbToLRGB(this.red);
    const g = rgbToLRGB(this.green);
    const b = rgbToLRGB(this.blue);
    const x = 0.4360747 * r + 0.3850649 * g + 0.1430804 * b;
    const y = 0.2225045 * r + 0.7168786 * g + 0.0606169 * b;
    const z = 0.0139322 * r + 0.0971045 * g + 0.7141733 * b;
    const fx = f(x / 0.96422);
    const fy = f(y);
    const fz = f(z / 0.82521);
    _classPrivateFieldLooseBase(this, _lab)[_lab] = {
      lightness: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
    };
  }

  _hslToRgb() {
    const { hue, saturation, lightness } = this.hsl;
    const scaledHue = hue / 360;
    const scaledSaturation = saturation / 100;
    const scaledLightness = lightness / 100;
    const m2 =
      scaledLightness <= 0.5
        ? scaledLightness * (scaledSaturation + 1)
        : scaledLightness + scaledSaturation - scaledLightness * scaledSaturation;
    const m1 = scaledLightness * 2 - m2;
    _classPrivateFieldLooseBase(this, _rgb)[_rgb] = {
      red: hueToRGB(m1, m2, scaledHue + 1 / 3),
      green: hueToRGB(m1, m2, scaledHue),
      blue: hueToRGB(m1, m2, scaledHue - 1 / 3),
    };
  }

  _labToRGB() {
    const lab = _classPrivateFieldLooseBase(this, _lab)[_lab];

    const dl = (lab.lightness + 16) / 116;
    const da = lab.a / 500;
    const db = lab.b / 200;
    const x = 0.96422 * f1(dl + da);
    const y = f1(dl);
    const z = 0.82521 * f1(dl - db);
    const r = 3.1338561 * x - 1.6168667 * y - 0.4906146 * z;
    const g = -0.9787684 * x + 1.9161415 * y + 0.033454 * z;
    const b = 0.0719453 * x - 0.2289914 * y + 1.4052427 * z;
    _classPrivateFieldLooseBase(this, _rgb)[_rgb] = {
      red: lrgbToRGB(r),
      green: lrgbToRGB(g),
      blue: lrgbToRGB(b),
    };
  }

  isOpaque() {
    return fuzzyEquals(this.alpha, 1);
  }

  toStringAsRgb() {
    const isOpaque = this.isOpaque();
    let buffer =
      (isOpaque ? "rgb" : "rgba") + `(${this.red}, ${this.green}, ${this.blue}`;

    if (!isOpaque) {
      buffer += `, ${this.alpha}`;
    }

    buffer += ")";
    return buffer;
  }

  toStringAsHex() {
    return (
      "#" +
      toHex(this.red) +
      toHex(this.green) +
      toHex(this.blue) +
      (this.isOpaque() ? "" : toHex(this.alpha * 255))
    );
  }

  invert(weight = 1) {
    const inverse = this.changeRgb(255 - this.red, 255 - this.green, 255 - this.blue);
    return _mixColors(inverse, this, weight);
  }

  grayscale() {
    return this.changeHSL("saturation", () => 0);
  }

  adjustHue(degrees) {
    return this.changeHSL("hue", hue => hue + degrees);
  }

  lighten(amount) {
    return this.darken(-amount);
  }

  darken(amount) {
    return this.changeHSL("lightness", lightness =>
      clamp(lightness - fuzzyAssertRange(amount, -100, 100, "amount"))
    );
  }

  saturate(amount) {
    return this.changeHSL("saturation", saturation =>
      clamp(saturation + fuzzyAssertRange(amount, -100, 100, "amount"))
    );
  }

  desaturate(amount) {
    return this.saturate(-amount);
  }

  get brightness() {
    if (this._brightness == null) {
      this._brightness = (this.red * 299 + this.green * 587 + this.blue * 114) / 1000;
    }

    return this._brightness;
  }
}

function hueToRGB(m1, m2, hue) {
  if (hue < 0) hue += 1;
  if (hue > 1) hue -= 1;
  let result;

  if (hue < 1 / 6) {
    result = m1 + (m2 - m1) * hue * 6;
  } else if (hue < 1 / 2) {
    result = m2;
  } else if (hue < 2 / 3) {
    result = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
  } else {
    result = m1;
  }

  return fuzzyRound(result * 255);
}

const rgbToLRGB = x => {
  x /= 255;
  return x > 0.04045 ? pow((x + 0.055) / 1.055, 2.4) : x / 12.92;
};

const lrgbToRGB = x => {
  x = x > 0.0031308 ? 1.055 * pow(x, 1 / 2.4) - 0.055 : 12.92 * x;
  x *= 255;
  return x < 0 ? 0 : x > 255 ? 255 : x;
};

const delta = 6 / 29;

const f = t => (t > pow(delta, 3) ? pow(t, 1 / 3) : t / (3 * delta * delta) + 4 / 29);

const f1 = t => (t > delta ? t * t * t : pow(delta, 3) * (t - 4 / 29));

function _mixColors(color1, color2, weight) {
  const weightScale = fuzzyAssertRange(weight, 0, 100, "weight") / 100;
  const normalizedWeight = weightScale * 2 - 1;
  const alphaDistance = color1.alpha - color2.alpha;
  const combinedWeight1 =
    normalizedWeight * alphaDistance === -1
      ? normalizedWeight
      : (normalizedWeight + alphaDistance) / (1 + normalizedWeight * alphaDistance);
  const weight1 = (combinedWeight1 + 1) / 2;
  const weight2 = 1 - weight1;
  const left = color1.rgb;
  const right = color2.rgb;
  return new Color({
    red: fuzzyRound(left.red * weight1 + right.red * weight2),
    green: fuzzyRound(left.green * weight1 + right.green * weight2),
    blue: fuzzyRound(left.blue * weight1 + right.blue * weight2),
    alpha: color1.alpha * weightScale + color2.alpha * (1 - weightScale),
  });
}

function clamp(number, min = 0, max = 100) {
  return number > max ? max : number < min ? min : number;
}

function parseRGBHex(text) {
  if (text[0] === "#") text = text.slice(1);
  return [
    parseHex(text[0] + text[1]),
    parseHex(text[2] + text[3]),
    parseHex(text[4] + text[5]),
    parseHex(text.slice(6)),
  ];
}

function parseHex(text) {
  const value = parseInt(text, 16);
  if (!isNaN(value)) return value;
}

function toHex(num) {
  return (num < 16 ? "0" : "") + Math.round(num).toString(16);
}

const epsilon = pow(10, -11);

const fuzzyEquals = (number1, number2, margin = epsilon) =>
  Math.abs(number1 - number2) < margin;

const fuzzyLessThan = (number1, number2) =>
  number1 < number2 && !fuzzyEquals(number1, number2);

const fuzzyLessThanOrEquals = (number1, number2) =>
  number1 < number2 || fuzzyEquals(number1, number2);

function fuzzyRound(number) {
  if (number > 0) {
    return fuzzyLessThan(number % 1, 0.5) ? floor(number) : ceil(number);
  } else {
    return fuzzyLessThanOrEquals(number % 1, 0.5) ? floor(number) : ceil(number);
  }
}

function fuzzyCheckRange(number, min, max) {
  if (fuzzyEquals(number, min)) return min;
  if (fuzzyEquals(number, max)) return max;
  if (number > min && number < max) return number;
}

function fuzzyAssertRange(number, min, max, name) {
  const result = fuzzyCheckRange(number, min, max);
  if (result != null) return result;
  throwRangeError(number, min, max, name);
}

function throwRangeError(number, min, max, name) {
  throw RangeError(`${name} must be between ${min} and ${max}, received ${number}.`);
}

function checkValueInInterval(number, min, max, name) {
  if (number < min || number > max) {
    throwRangeError(number, min, max, name);
  }
}

const literals = {
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
};

const darkModeMedia = "(prefers-color-scheme:dark)";
const darkMode = matchMedia(darkModeMedia);
const isDarkMode = () => darkMode.matches;
const lightness = "lightness";
function kebabCase(camelCase) {
  return camelCase.replace(/[A-Z]/g, match => "-" + match.toLowerCase());
}
const strongMemoize = ifAbsent => {
  const cache = new Map();
  return value => {
    if (!cache.has(value)) {
      cache.set(value, ifAbsent(value));
    }

    return cache.get(value);
  };
};
const weakMemoize = ifAbsent => {
  const cache = new WeakMap();
  return value => {
    if (!cache.has(value)) {
      cache.set(value, ifAbsent(value));
    }

    return cache.get(value);
  };
};
const handleText = strongMemoize(color => {
  const l = color.lab.lightness;
  const next =
    l < 0.1
      ? config.textColor
      : l > 60
      ? color.toStringAsHex()
      : color.changeLAB(lightness, () => 100 - 0.6 * l).toStringAsHex();
  return next;
});
const handleBorder = color => {
  var _invertColor;

  return (_invertColor = invertColor(color)) != null
    ? _invertColor
    : color.changeLAB(lightness, l => 100 - 0.8 * l);
};
const handleBackground = color => {
  var _invertColor2;

  return (_invertColor2 = invertColor(color)) != null
    ? _invertColor2
    : color.lab.lightness > 60
    ? color.changeLAB(lightness, l => 80 - 0.6 * l)
    : color;
};
let backgroundInversionMap;

function invertColor(color) {
  const hex = color.toStringAsHex().slice(1);

  if (!backgroundInversionMap) {
    backgroundInversionMap = new Map(
      Object.entries(config.replaceMap).map(([left, right]) => [
        left,
        Color.parseHex("#" + right),
      ])
    );
  }

  return backgroundInversionMap.get(hex);
}

let external;
let inline;
const processed = "data-processed";
function appendNodes() {
  external = createElement("style", {
    media: darkModeMedia,
    [processed]: "true",
  });
  inline = external.cloneNode();
  document.documentElement.append(external, inline);
}
let counter = 1;
const getIndex = weakMemoize(() => counter++);
const validNodeID = /^[A-Z0-9_-]$/i;
const processedRules = new WeakSet();
const attachSelector = weakMemoize(node => {
  const prefix = node.id && validNodeID.test(node.id) ? `#${node.id}` : "";
  const index = getIndex(node);
  node.setAttribute(config.attribute, index);
  return prefix + `[${config.attribute}="${index}"]`;
});
const getStyleRule = weakMemoize(el => {
  const index = inline.sheet.insertRule(attachSelector(el) + "{}");
  const rule = inline.sheet.cssRules.item(index);
  processedRules.add(rule);
  return rule;
});

const arr = Array.from;
const instructions = [];

const replace = (key, map, fn) => {
  const cache = new Map();

  if (Array.isArray(key)) {
    const fns = key.map(key => replace(key, map, fn));
    return (rule, applyNow) => fns.some(fn => fn(rule, applyNow));
  }

  return (rule, applyNow) => {
    if (!rule.styleMap.has(key)) return false;
    const current = rule.styleMap.get(key).toString();

    if (!cache.has(current)) {
      const mapped = map(current);
      let edited = mapped && fn(mapped);

      if (edited instanceof Color) {
        edited = edited.toStringAsHex();
      }

      cache.set(current, edited);
    }

    const next = cache.get(current);

    if (next != null) {
      if (applyNow) {
        rule.styleMap.set(key, next);
      }

      instructions.push({
        rule,
        property: key,
        light: current,
        dark: next,
      });
    }

    return true;
  };
};

function extractNewRules() {
  const rules = arr(document.styleSheets)
    .flatMap(sheet => {
      try {
        return arr(sheet.cssRules);
      } catch (_unused) {
        return [];
      }
    })
    .filter(rule => !processedRules.has(rule));
  rules.forEach(rule => processedRules.add(rule));
  return rules;
}

const editBackground = replace(["background-color"], Color.parseSafe, handleBackground);
const editTextColor = replace(["color"], Color.parseSafe, handleText);
const editBorderColor = replace(["border-color"], Color.parseSafe, handleBorder);
const editSpecificBorderColor = replace(
  ["border-top-color", "border-left-color", "border-right-color", "border-bottom-color"],
  Color.parseSafe,
  handleBorder
);
function recordExternalColors(applyNow) {
  const rules = extractNewRules();

  function recordRule(rule) {
    if (rule instanceof CSSMediaRule) {
      var _rule$conditionText;

      return (
        ((_rule$conditionText = rule.conditionText) == null
          ? void 0
          : _rule$conditionText.includes("prefers-color")) ||
        [...rule.cssRules].forEach(recordRule)
      );
    }

    if (rule instanceof CSSStyleRule) {
      var _config$hooks;

      if (
        ((_config$hooks = config.hooks) == null
          ? void 0
          : _config$hooks.onCSSStyleRule == null
          ? void 0
          : _config$hooks.onCSSStyleRule(rule)) === false
      )
        return;
      editBackground(rule, applyNow);
      editTextColor(rule, applyNow);
      editBorderColor(rule, applyNow);

      if (!rule.styleMap.has("border-color")) {
        editSpecificBorderColor(rule, applyNow);
      }
    }
  }

  rules.forEach(recordRule);
}
function applyExternals(isDarkMode) {
  instructions.forEach(({ rule, property, light, dark }) => {
    rule.styleMap.set(property, isDarkMode ? dark : light);
  });
}

let temp;
const getRealColor = strongMemoize(text => {
  if (text.startsWith("rgb(") || text[0] === "#" || text in literals) {
    return Color.parse(text);
  }

  temp.style.color = text;
  return Color.parse(getComputedStyle(temp).color);
});
function applyInline() {
  var _temp;

  (_temp = temp) != null
    ? _temp
    : (temp = createElement("span", {
        style: {
          display: "none",
        },
      }));
  document.body.appendChild(temp);
  const styles = [...document.querySelectorAll("[style]:not([data-css])")];

  const match = text => styles.filter(node => node.getAttribute("style").includes(text));

  const matchStrict = prop => styles.filter(node => node.attributeStyleMap.has(prop));

  matchStrict("color").forEach(node => {
    if (!node.style.color) return;
    const next = handleText(getRealColor(node.style.color));
    getStyleRule(node).style.setProperty("color", next, "important");
  });
  const keys = [
    "borderTopColor",
    "borderLeftColor",
    "borderRightColor",
    "borderBottomColor",
  ];
  match("border").forEach(node => {
    for (const key of keys) {
      if (node.style[key]) {
        const next = getRealColor(node.style[key]).map(handleBorder).toStringAsRgb();
        getStyleRule(node).style.setProperty(kebabCase(key), next, "important");
      }
    }
  });
  match("background").forEach(node => {
    var _node$textContent;

    if (!/^(th|td|tr|div|span|p|table|caption)$/i.test(node.tagName)) return;
    const key = "backgroundColor";
    const original = node.style[key];
    if (original === "transparent") return;
    const color = getRealColor(original);
    let next;

    if (
      ((_node$textContent = node.textContent) == null
        ? void 0
        : _node$textContent.trim().length) ||
      ["TH", "TD"].includes(node.tagName)
    ) {
      next = handleBackground(color);
    }

    if (next) {
      getStyleRule(node).style.setProperty(
        kebabCase(key),
        next.toStringAsRgb(),
        "important"
      );
    }
  });
  temp.remove();
}

const config = {
  attribute: "data-css-" + Math.floor(Math.random() * 100),
  textColor: "#ebebeb",
  hooks: {
    onCSSStyleRule(style) {},
  },
  replaceMap: {
    ffffff: "121212",
  },
};
async function start(configs) {
  Object.assign(config, configs);
  appendNodes();
  applyInline();

  if (isDarkMode()) {
    recordExternalColors(true);
    darkMode.addEventListener("change", e => {
      applyExternals(e.matches);
    });
    new MutationObserver(() => {
      applyInline();
      recordExternalColors(isDarkMode());
    }).observe(document.head, {
      childList: true,
      subtree: false,
    });
  }
}

export { config, start };
