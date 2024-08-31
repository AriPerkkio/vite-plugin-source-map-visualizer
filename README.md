# vite-plugin-source-map-visualizer

<a href="https://www.npmjs.com/package/vite-plugin-source-map-visualizer">
    <img alt="version" src="https://img.shields.io/npm/v/vite-plugin-source-map-visualizer" />
</a>

[Installation](#installation) | [Configuration](#configuration) | [Credits](#credits)

> Vite plugin for generating source map visualizations of transform results

`vite-plugin-source-map-visualizer` is a Vite plugin for inspecting source maps of the transformed files. It generates HTML report that provides quick way for seeing how the tranformed files look in [source-map-visualization](https://github.com/evanw/source-map-visualization). See [live example](https://ariperkkio.github.io/vite-plugin-source-map-visualizer/).

For more detailed plugin debugging tool you might want to check [`vite-plugin-inspect`](https://github.com/antfu-collective/vite-plugin-inspect) instead.

<br />

[vite-plugin-source-map-visualizer.webm](https://github.com/user-attachments/assets/f93039d9-da22-459d-b933-1a49467e67a9)

<br />
<br />

## Installation

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

## Configuration

You can pass options to the plugin as function arguments:

```ts
export default defineConfig({
  plugins: [
    sourcemapVisualizer({
      filename: "my-report.html",
    }),
  ],
});
```

### `filename`

Filename for the report. Defaults to `report.html`.

### `outDir`

Directory for the output. Defaults to `.vite-source-map-visualizer`.

### `silent`

Silence plugin's verbose logging.

### `formatName`

Format name of the files:

```ts
export default defineConfig({
  plugins: [
    sourcemapVisualizer({
      formatName: (filename) => filename.replace("src/", "/"),
    }),
  ],
});
```

## Credits

Special thanks to:

- [`vite-plugin-inspect`](https://github.com/antfu-collective/vite-plugin-inspect) from [@antfu](https://github.com/antfu)
- [source-map-visualization](https://github.com/evanw/source-map-visualization) from [@evanw](https://github.com/evanw)
