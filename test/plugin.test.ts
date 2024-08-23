import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, expect, test } from "vitest";
import { createServer, Plugin, UserConfig } from "vite";
import MagicString from "magic-string";

import { sourcemapVisualizer } from "../src/index.js";

const fixture = "fixtures/first.ts";
const outDir = ".test-plugin";

afterEach(() => {
  rmSync(outDir, { force: true, recursive: true });
});

test("forces plugin as last", async () => {
  const server = await run(
    sourcemapVisualizer({ outDir }),

    transformPlugin({
      name: "first",
      enforce: "pre",
      from: 'return "First";',
      to: 'return "Output changed!";',
    }),

    transformPlugin({
      name: "second",
      enforce: "post",
      from: "input",
      to: "inputChange",
    })
  );

  const customPlugins = server.config.plugins
    .filter((p) =>
      ["source-map-visualizer", "first", "second"].includes(p.name)
    )
    .map((p) => p.name);

  expect(customPlugins).toMatchInlineSnapshot(`
    [
      "first",
      "second",
      "source-map-visualizer",
    ]
  `);
});

function transformPlugin(options: {
  name: string;
  from: string;
  to: string;
  enforce: Plugin["enforce"];
}): Plugin {
  return {
    name: options.name,
    enforce: options.enforce,
    transform(code, id) {
      if (id.includes(fixture)) {
        const s = new MagicString(code);
        s.replace(options.from, options.to);

        return { code: s.toString(), map: s.generateMap({ hires: false }) };
      }
    },
  };
}

async function run(...plugins: NonNullable<UserConfig["plugins"]>) {
  const server = await createServer({
    configFile: false,
    plugins,
    root: fileURLToPath(new URL("..", import.meta.url)),
    logLevel: "error",
  });

  await server.listen();

  await server.transformRequest(
    fileURLToPath(new URL(fixture, import.meta.url).href)
  );

  server.close();

  return server;
}
