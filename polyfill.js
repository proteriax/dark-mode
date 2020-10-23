/* eslint-disable */
import _classPrivateFieldLooseBase from "@babel/runtime/helpers/classPrivateFieldLooseBase";
import _classPrivateFieldLooseKey from "@babel/runtime/helpers/classPrivateFieldLooseKey";

var _value = _classPrivateFieldLooseKey("value");

class CSSKeywordValue {
  constructor(value) {
    Object.defineProperty(this, _value, {
      writable: true,
      value: void 0,
    });
    assertArgumentLength(arguments.length, 1, "construct 'CSSKeywordValue'");
    _classPrivateFieldLooseBase(this, _value)[_value] = String(value);
  }

  get value() {
    return _classPrivateFieldLooseBase(this, _value)[_value];
  }

  set value(newValue) {
    _classPrivateFieldLooseBase(this, _value)[_value] = String(newValue);
  }

  toString() {
    return `${this.value}`;
  }
}

Object.defineProperties(CSSKeywordValue.prototype, {
  value: {
    enumerable: true,
  },
});

var _value2 = _classPrivateFieldLooseKey("value");

class CSSMathInvert {
  constructor(value) {
    Object.defineProperty(this, _value2, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _value2)[_value2] = value;
  }

  get operator() {
    return "invert";
  }

  get value() {
    return _classPrivateFieldLooseBase(this, _value2)[_value2];
  }

  toString() {
    return `calc(1 / ${_classPrivateFieldLooseBase(this, _value2)[_value2]})`;
  }
}

var _value3 = _classPrivateFieldLooseKey("value");

class CSSMathMax {
  constructor(...values) {
    Object.defineProperty(this, _value3, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _value3)[_value3] = values;
  }

  get operator() {
    return "max";
  }

  get values() {
    return _classPrivateFieldLooseBase(this, _value3)[_value3];
  }

  toString() {
    return `max(${_classPrivateFieldLooseBase(this, _value3)[_value3].join(", ")})`;
  }
}

var _value4 = _classPrivateFieldLooseKey("value");

class CSSMathMin {
  constructor(...values) {
    Object.defineProperty(this, _value4, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _value4)[_value4] = values;
  }

  get operator() {
    return "min";
  }

  get values() {
    return _classPrivateFieldLooseBase(this, _value4)[_value4];
  }

  toString() {
    return `min(${_classPrivateFieldLooseBase(this, _value4)[_value4].join(", ")})`;
  }
}

var _value5 = _classPrivateFieldLooseKey("value");

class CSSMathProduct {
  constructor(...values) {
    Object.defineProperty(this, _value5, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _value5)[_value5] = values;
  }

  get operator() {
    return "product";
  }

  get values() {
    return _classPrivateFieldLooseBase(this, _value5)[_value5];
  }

  toString() {
    return (
      "calc" +
      _classPrivateFieldLooseBase(this, _value5)[_value5].reduce(
        (accum, value) =>
          value instanceof CSSMathInvert
            ? `${accum ? `${accum} / ` : "1 / "}${value.value}`
            : `${accum ? `${accum} * ` : ""}${value}`,
        ""
      ) +
      ")"
    );
  }
}

var _value6 = _classPrivateFieldLooseKey("value");

class CSSMathSum {
  constructor(...values) {
    Object.defineProperty(this, _value6, {
      writable: true,
      value: void 0,
    });
    _classPrivateFieldLooseBase(this, _value6)[_value6] = values;
  }

  get operator() {
    return "product";
  }

  get values() {
    return _classPrivateFieldLooseBase(this, _value6)[_value6];
  }

  toString() {
    return `calc(${_classPrivateFieldLooseBase(this, _value6)[_value6].reduce(
      (accum, value) => `${accum ? `${accum} + ` : ""}${value}`,
      ""
    )})`;
  }
}

class CSSStyleValue {
  constructor() {
    throw TypeError("Illegal constructor");
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
};

class CSSNumericValue {
  add(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (const arg of args) {
      if (arg instanceof Constructor) {
        if (values.length || result.unit !== arg.unit) {
          values.push(arg);
        } else {
          result.value += arg.value;
        }
      } else if (
        arg instanceof CSSMathProduct ||
        arg instanceof CSSMathMax ||
        arg instanceof CSSMathMin ||
        arg instanceof CSSMathInvert
      ) {
        values.push(arg);
      } else {
        return null;
      }
    }

    return values.length ? new CSSMathSum(result, ...values) : result;
  }

  div(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (let arg of args) {
      if (typeof arg === "number") {
        arg = new CSSUnitValue(arg, "number");
      }

      if (arg instanceof Constructor) {
        if (values.length || (result.unit !== arg.unit && arg.unit !== "number")) {
          values.push(arg);
        } else {
          result.value /= arg.value;
        }
      } else {
        return null;
      }
    }

    return values.length
      ? new CSSMathProduct(result, ...values.map(value => new CSSMathInvert(value)))
      : result;
  }

  max(...args) {
    const result = new CSSUnitValue(this.value, this.unit);
    const values = [result];

    for (const arg of args) {
      if (arg instanceof CSSUnitValue) {
        if (values.length > 1 || result.unit !== arg.unit) {
          values.push(arg);
        } else {
          result.value = Math.max(result.value, arg.value);
        }
      } else {
        return null;
      }
    }

    return values.length > 1 ? new CSSMathMax(...values) : result;
  }

  min(...args) {
    const result = new CSSUnitValue(this.value, this.unit);
    const values = [result];

    for (const arg of args) {
      if (arg instanceof CSSUnitValue) {
        if (values.length > 1 || result.unit !== arg.unit) {
          values.push(arg);
        } else {
          result.value = Math.min(result.value, arg.value);
        }
      } else {
        return null;
      }
    }

    return values.length > 1 ? new CSSMathMin(...values) : result;
  }

  mul(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (let arg of args) {
      if (typeof arg === "number") {
        arg = new CSSUnitValue(arg, "number");
      }

      if (arg instanceof Constructor) {
        if (values.length || (result.unit !== arg.unit && arg.unit !== "number")) {
          values.push(arg);
        } else {
          result.value *= arg.value;
        }
      } else {
        return null;
      }
    }

    return values.length ? new CSSMathProduct(result, ...values) : result;
  }

  sub(...args) {
    const Constructor = this.constructor;
    const result = new Constructor(this.value, this.unit);
    const values = [];

    for (const arg of args) {
      if (arg instanceof Constructor) {
        if (values.length || result.unit !== arg.unit) {
          values.push(new Constructor(arg.value * -1, arg.unit));
        } else {
          result.value -= arg.value;
        }
      } else {
        return null;
      }
    }

    return values.length ? new CSSMathSum(result, ...values) : result;
  }
}

var _value7 = _classPrivateFieldLooseKey("value");

var _unit = _classPrivateFieldLooseKey("unit");

class CSSUnitValue extends CSSNumericValue {
  constructor(value, unit) {
    super();
    Object.defineProperty(this, _value7, {
      writable: true,
      value: void 0,
    });
    Object.defineProperty(this, _unit, {
      writable: true,
      value: void 0,
    });
    assertArgumentLength(arguments.length, 2, "construct 'CSSUnitValue'");
    _classPrivateFieldLooseBase(this, _value7)[_value7] = getFiniteNumber(value);
    _classPrivateFieldLooseBase(this, _unit)[_unit] = getUnit(unit);
  }

  get value() {
    return _classPrivateFieldLooseBase(this, _value7)[_value7];
  }

  set value(newValue) {
    _classPrivateFieldLooseBase(this, _value7)[_value7] = getFiniteNumber(newValue);
  }

  get unit() {
    return _classPrivateFieldLooseBase(this, _unit)[_unit];
  }

  toString() {
    return `${this.value}${units[this.unit]}`;
  }
}

Object.defineProperties(CSSUnitValue.prototype, {
  value: {
    enumerable: true,
  },
  unit: {
    enumerable: true,
  },
});

function getFiniteNumber(value) {
  if (isNaN(value) || Math.abs(value) === Infinity) {
    throw TypeError(
      `Failed to set the 'value' property on 'CSSUnitValue': The provided double value is non-finite.`
    );
  }

  return Number(value);
}

function getUnit(unit) {
  if (!Object.keys(units).includes(unit)) {
    throw TypeError(`Failed to construct 'CSSUnitValue': Invalid unit: ${unit}`);
  }

  return unit;
}

const parseAsValue = string => {
  const unitParsingMatch = String(string).match(unitParsingMatcher);

  if (unitParsingMatch) {
    const [, value, unit = ""] = unitParsingMatch;
    return new CSSUnitValue(value, unitKeys[unitValues.indexOf(unit)]);
  }

  return new CSSKeywordValue(string);
};

const unitKeys = Object.keys(units);
const unitValues = Object.values(units);
const unitParsingMatcher = RegExp(`^([-+]?[0-9]*.?[0-9]+)(${unitValues.join("|")})?$`);
const unimplemented = "Unimplemented";

class StylePropertyMap {
  constructor() {
    throw TypeError("Illegal constructor");
  }

  get(property) {
    assertArgumentLength(arguments.length, 1, "'get' on 'StylePropertyMapReadOnly'");
    const value = this.style.getPropertyValue(property);

    if (value) {
      return parseAsValue(value);
    }

    return null;
  }

  append() {
    throw unimplemented;
  }

  clear() {
    const { style } = this;

    while (style.length) {
      const item = style.item(0);
      style.removeProperty(item);
    }
  }

  delete(key) {
    this.style.removeProperty(key);
  }

  has(key) {
    return !!this.style[key];
  }

  get size() {
    return this.style.length;
  }

  set(property, value) {
    assertArgumentLength(arguments.length, 2, "'set' on 'StylePropertyMap'");
    this.style.setProperty(property, String(value));
  }
}

function assertArgumentLength(length, minimum, name) {
  if (length < minimum) {
    throw TypeError(
      `Failed to ${name}: ${minimum} arguments required, but only ${length} present.`
    );
  }
}

function defaults(target, source) {
  for (const key of Object.keys(source)) {
    if (!target[key]) {
      target[key] = source[key];
    }
  }
}

function polyfill(window) {
  const global = window;
  defaults(global, {
    CSS: class CSS {},
  });
  Object.keys(units).forEach(unit => {
    defaults(global.CSS, {
      [unit]: value => new CSSUnitValue(value, unit),
    });
  });
  defineProperty(global.CSSRule, "styleMap", context => context.style);
  defineProperty(global.Element, "attributeStyleMap", context => context.style);
  defineProperty(global.Element, "computedStyleMap", context =>
    getComputedStyle(context)
  );
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
  });

  function defineProperty(Class, property, getStyle) {
    if (!(property in Class.prototype)) {
      Object.defineProperty(Class.prototype, property, {
        configurable: true,
        enumerable: true,

        get() {
          const computedStyleMap = Object.create(StylePropertyMap.prototype);
          computedStyleMap.style = getStyle(this);
          return computedStyleMap;
        },
      });
    }
  }
}

export { polyfill };
