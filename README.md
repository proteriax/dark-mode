# dark-mode

Programmatically apply dark mode to pages.

## Usage

```sh
yarn add proteriax/dark-mode#dist
```

```ts
import { start } from "dark-mode"

// For Firefox only
import { polyfill } from "dark-mode/polyfill"
polyfill(window)

// All options are optional
start({
  attribute: "data-my-dark-css",
  textColor: "#ebebeb",
  replaceMap: {
    "000000": "121212",
  },
  hooks: {
    shouldApplyBackground(node) {
      return /^(th|td|tr|div|span|p|table|caption|kbd)$/i.test(node.tagName)
    },
  },
})
```

## License

MIT
