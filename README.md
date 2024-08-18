# vite-plugin-source-map-visualizer

## Install

```bash
$ npm install --save-dev vite-plugin-source-map-visualizer
```

```ts
import { defineConfig } from "vite";
import { sourcemapVisualizer } from "vite-plugin-source-map-visualizer";

export default defineConfig({
  plugins: [sourcemapVisualizer()],
});
```

Run Vite and check `.vite-source-map-visualizer/report.html`:

```
└── .vite-source-map-visualizer
    └── report.html
```

## Credits

- [`vite-plugin-inspect`](https://github.com/antfu-collective/vite-plugin-inspect) from [@antfu](https://github.com/antfu)
- [source-map-visualization](https://github.com/evanw/source-map-visualization) from [@evanw](https://github.com/evanw)
