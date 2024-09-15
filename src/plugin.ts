import fs from "node:fs/promises";
import { join } from "node:path";
import type { Logger, Plugin } from "vite";
import type { TransformResult } from "vite";

import { toVisualizer } from "./generate-link.js";
import { script, style } from "./report.js";

const PLUGIN_NAME = "source-map-visualizer";

interface Options {
  /** Filename for the report. Defaults to `report.html` */
  filename?: string;

  /** Directory for the output. Defaults to `.vite-source-map-visualizer` */
  outDir?: string;

  /** Format name of the transformed file */
  formatName?: (filename: string) => string;

  /** Silence verbose logging. */
  silent?: boolean;
}

interface Result {
  filename: string;
  hash: string;
  ssr: boolean;
  code: TransformResult["code"];
  map: TransformResult["map"];
}

/**
 * Generate HTML report for inspecting the transformed files in https://evanw.github.io/source-map-visualization/
 */
export function sourcemapVisualizer(options?: Options): Plugin {
  let logger: Logger;
  const results: Result[] = [];

  const outDir = join(
    process.cwd(),
    options?.outDir || ".vite-source-map-visualizer"
  );

  const reportName = options?.filename || "report.html";
  const formatName = options?.formatName || defaultFormatName;
  const silent = options?.silent || false;

  return {
    name: PLUGIN_NAME,
    enforce: "post",

    async config() {
      await fs.rm(outDir, { force: true, recursive: true });
      await fs.mkdir(outDir);
    },

    configResolved(config) {
      logger = config.logger;

      try {
        const index = config.plugins.findIndex(
          (plugin) => plugin.name === PLUGIN_NAME
        );
        // @ts-expect-error -- types are readonly
        const plugin = config.plugins.splice(index, 1)[0];

        // @ts-expect-error -- types are readonly
        config.plugins.push(plugin);
      } catch (error) {
        console.error(
          `${PLUGIN_NAME} failed to force itself as last Vite plugin`
        );
        throw error;
      }
    },

    transform(code, id, options) {
      const map = this.getCombinedSourcemap();
      const hash = toVisualizer({ code, map });
      const filename = formatName(id);
      const ssr = options?.ssr || false;

      results.push({ filename, hash, code, map, ssr });
    },

    async buildEnd() {
      try {
        const filename = `${outDir}/${reportName}`;
        const html = generateHTML(results);
        await fs.writeFile(filename, html, "utf8");

        if (!silent) {
          logger.info(`Report written to ${filename}`);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  };
}

function generateHTML(results: Result[]) {
  // prettier-ignore
  return `
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vite Source Map Visualizer</title>
  <style>
    ${style()}
  </style>
</head>
<body>
  <main>
    <h1>
      <a href="#">Vite Source Map Visualizer</a>
    </h1>

    <button id="json-view-toggle" title="View transform results" style="display: none;">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><g><rect width="24" height="24" opacity="0"/><path d="M15 16H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2z"/><path d="M9 14h3a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2z"/><path d="M19.74 8.33l-5.44-6a1 1 0 0 0-.74-.33h-7A2.53 2.53 0 0 0 4 4.5v15A2.53 2.53 0 0 0 6.56 22h10.88A2.53 2.53 0 0 0 20 19.5V9a1 1 0 0 0-.26-.67zM14 5l2.74 3h-2a.79.79 0 0 1-.74-.85zm3.44 15H6.56a.53.53 0 0 1-.56-.5v-15a.53.53 0 0 1 .56-.5H12v3.15A2.79 2.79 0 0 0 14.71 10H18v9.5a.53.53 0 0 1-.56.5z"/></g></g></svg>
    </button>

    <button id="visualizer-view-toggle" title="View visualizer" style="display: none;">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><g><rect width="24" height="24" opacity="0"/><path d="M20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z"/></g></g></svg>
    </button>

    <button id="menu" title="Toggle file list">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><g><rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/><rect x="3" y="11" width="18" height="2" rx=".95" ry=".95"/><rect x="3" y="16" width="18" height="2" rx=".95" ry=".95"/><rect x="3" y="6" width="18" height="2" rx=".95" ry=".95"/></g></g></svg>
    </button>

    <button id="theme-toggle" title="Toggle theme">
      <svg id="theme-icon-light" aria-hidden="true" class="theme-light" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><g><rect width="24" height="24" transform="rotate(180 12 12)" opacity="0"/><path d="M12 6a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1z"/><path d="M21 11h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2z"/><path d="M6 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1z"/><path d="M6.22 5a1 1 0 0 0-1.39 1.47l1.44 1.39a1 1 0 0 0 .73.28 1 1 0 0 0 .72-.31 1 1 0 0 0 0-1.41z"/><path d="M17 8.14a1 1 0 0 0 .69-.28l1.44-1.39A1 1 0 0 0 17.78 5l-1.44 1.42a1 1 0 0 0 0 1.41 1 1 0 0 0 .66.31z"/><path d="M12 18a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"/><path d="M17.73 16.14a1 1 0 0 0-1.39 1.44L17.78 19a1 1 0 0 0 .69.28 1 1 0 0 0 .72-.3 1 1 0 0 0 0-1.42z"/><path d="M6.27 16.14l-1.44 1.39a1 1 0 0 0 0 1.42 1 1 0 0 0 .72.3 1 1 0 0 0 .67-.25l1.44-1.39a1 1 0 0 0-1.39-1.44z"/><path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/></g></g></svg>
      <svg id="theme-icon-dark" aria-hidden="true" class="theme-dark"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><g><rect width="24" height="24" opacity="0"/><path d="M12.3 22h-.1a10.31 10.31 0 0 1-7.34-3.15 10.46 10.46 0 0 1-.26-14 10.13 10.13 0 0 1 4-2.74 1 1 0 0 1 1.06.22 1 1 0 0 1 .24 1 8.4 8.4 0 0 0 1.94 8.81 8.47 8.47 0 0 0 8.83 1.94 1 1 0 0 1 1.27 1.29A10.16 10.16 0 0 1 19.6 19a10.28 10.28 0 0 1-7.3 3zM7.46 4.92a7.93 7.93 0 0 0-1.37 1.22 8.44 8.44 0 0 0 .2 11.32A8.29 8.29 0 0 0 12.22 20h.08a8.34 8.34 0 0 0 6.78-3.49A10.37 10.37 0 0 1 7.46 4.92z"/></g></g></svg>
    </button>

    <details id="files" open>
      <summary>File list</summary>

      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Transform mode</th>
            <th>Link</th>
          </tr>
        </thead>

        <tbody>
          ${results.map((result) => `
            <tr>
              <td>
                <a href="#${result.hash}">
                  ${escapeHTML(result.filename)}
                </a>
              </td>
              <td>
                ${result.ssr ? "SSR" : "Web"}
              </td>
              <td class="center">
                <a title="Open in source-map-visualization" target="_blank" href="https://evanw.github.io/source-map-visualization#${result.hash}">
                  <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><g><rect width="24" height="24" opacity="0"/><path d="M20 11a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1z"/><path d="M16 5h1.58l-6.29 6.28a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L19 6.42V8a1 1 0 0 0 1 1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-4a1 1 0 0 0 0 2z"/></g></g></svg>
                </a>
              </td>
            </tr>
          `.trim()).join("\n")}
        </tbody>
      </table>

    </details>

    <div id="json-visualizer" style="display: none;"></div>
    <iframe id="source-map-visualizer" style="display: none;"></iframe>
  </main>
  <script>
      (${script.toString()})()
  </script>
</body>
</html>
`.trim();
}

function defaultFormatName(filename: string) {
  return filename.replace(process.cwd(), "");
}

function escapeHTML(str: string) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      // @ts-expect-error -- umm...
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag])
  );
}
