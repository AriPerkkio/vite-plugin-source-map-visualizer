import { existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, onTestFinished, test } from "vitest";
import { createServer } from "vite";

import { sourcemapVisualizer } from "../src/index.js";
import { afterEach } from "node:test";

afterEach(() => {
  rmSync(".vite-source-map-visualizer", { force: true, recursive: true });
});

test("generates default report", async () => {
  await run();

  expect(existsSync(".vite-source-map-visualizer")).toBeTruthy();
  expect(existsSync(".vite-source-map-visualizer/report.html")).toBeTruthy();
});

test("generates report with custom filename", async () => {
  await run({ filename: "custom-report.html" });

  expect(existsSync(".vite-source-map-visualizer")).toBeTruthy();
  expect(
    existsSync(".vite-source-map-visualizer/custom-report.html")
  ).toBeTruthy();
});

test("generates report in custom directory", async () => {
  onTestFinished(() =>
    rmSync(".custom-report-directory", { force: true, recursive: true })
  );
  await run({ outDir: ".custom-report-directory" });

  expect(existsSync(".custom-report-directory")).toBeTruthy();
  expect(existsSync(".custom-report-directory/report.html")).toBeTruthy();
});

async function run(options?: Parameters<typeof sourcemapVisualizer>[0]) {
  const FIXTURES = fileURLToPath(new URL("./fixtures", import.meta.url).href);
  const FILES = readdirSync(FIXTURES).map((file) => `${FIXTURES}/${file}`);

  const server = await createServer({
    configFile: false,
    plugins: [sourcemapVisualizer(options)],
    root: fileURLToPath(new URL("..", import.meta.url)),
    server: { port: 5173 },
    logLevel: "error",
  });

  await server.listen();

  for (const [index, filename] of FILES.entries()) {
    await server.transformRequest(filename, { ssr: index % 2 === 0 });
  }

  server.close();
}
