import { readFileSync } from "node:fs";

/* v8 ignore start -- This is not executed by tests */
export function script() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setting = localStorage.getItem("theme");

  if (setting === "dark" || (prefersDark && setting !== "light"))
    document.documentElement.dataset.theme = "dark";

  const themeToggle = document.querySelector("button#theme-toggle")!;
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  const menu = document.querySelector("button#menu")!;
  menu.addEventListener("click", () => {
    const fileList = document.querySelector("details#files" as "details")!;
    fileList.open = !fileList.open;
  });

  const url = new URL(window.location.href);
  const filename = url.searchParams.get("filename");

  if (filename) {
    const iframe = document.querySelector(
      "iframe#source-map-visualizer" as "iframe"
    )!;
    iframe.src = `https://evanw.github.io/source-map-visualization${url.hash}`;
    iframe.style.display = "block";

    const fileList = document.querySelector("details#files" as "details")!;
    fileList.open = false;
  }
}
/* v8 ignore stop */

export function style() {
  return readFileSync(new URL("./styles.css", import.meta.url), "utf8");
}
