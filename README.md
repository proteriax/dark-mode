# dark-mode

Programmatically apply dark mode to pages.

## Usage

```sh
yarn add proteriax/dark-mode#dist
```

```ts
import { start } from "dark-mode"

// All options are optional
start({
  attribute: "data-my-dark-css",
  textColor: "#ebebeb",
  replaceMap: {
    "000000": "121212",
  },
})
```

## License

MIT
