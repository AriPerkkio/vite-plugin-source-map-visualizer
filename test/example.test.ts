import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

import { sourcemapVisualizer } from "../src/index.js";

const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url).href);
const FILES = readdirSync(FIXTURES).map((file) => `${FIXTURES}/${file}`);

const server = await createServer({
  configFile: false,
  plugins: [sourcemapVisualizer()],
  root: fileURLToPath(new URL("..", import.meta.url)),
  server: { port: 5173 },
});

await server.listen();

for (const [index, filename] of FILES.entries()) {
  await server.transformRequest(filename, { ssr: index % 2 === 0 });
}

server.close();
