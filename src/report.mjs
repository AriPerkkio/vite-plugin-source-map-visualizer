import { readFileSync } from "node:fs";

export function script() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setting = localStorage.getItem("theme");

  if (setting === "dark" || (prefersDark && setting !== "light"))
    document.documentElement.dataset.theme = "dark";

  const themeToggle = document.querySelector("button#theme-toggle");
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  const url = new URL(window.location);
  const filename = url.searchParams.get("filename");

  if (filename) {
    /** @type {HTMLIFrameElement} */
    const iframe = document.querySelector("iframe#source-map-visualizer");
    iframe.src = `https://evanw.github.io/source-map-visualization${url.hash}`;
    iframe.style.display = "block";

    /** @type {HTMLDetailsElement} */
    const fileList = document.querySelector("details#files");
    fileList.open = false;
  }
}

export function style() {
  return readFileSync(new URL("./styles.css", import.meta.url), "utf8");
}
