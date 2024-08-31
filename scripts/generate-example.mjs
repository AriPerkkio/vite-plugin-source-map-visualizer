import { existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

import { sourcemapVisualizer } from "../dist/index.js";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures", import.meta.url).href
);
const FILES = readdirSync(FIXTURES).map((file) => `${FIXTURES}/${file}`);

const server = await createServer({
  configFile: false,
  plugins: [sourcemapVisualizer({ filename: "index.html", outDir: "example" })],
  logLevel: "info",
});

await server.listen();

for (const [index, filename] of FILES.entries()) {
  await server.transformRequest(filename, { ssr: index % 2 === 0 });
}

server.close();
