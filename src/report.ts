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

  const jsonView = document.getElementById("json-visualizer")!;
  const visualizerView = document.getElementById("source-map-visualizer")!;
  const jsonViewToggle = document.querySelector(
    "button#json-view-toggle" as "button"
  )!;
  const visualizerViewToggle = document.querySelector(
    "button#visualizer-view-toggle" as "button"
  )!;

  function setView(view: "json-view" | "visualizer-view") {
    if (view === "json-view") {
      visualizerView.style.display = "none";
      jsonViewToggle.style.display = "none";
      visualizerViewToggle.style.display = "block";
      jsonView.style.display = "block";
    } else {
      jsonView.style.display = "none";
      visualizerViewToggle.style.display = "none";
      visualizerView.style.display = "block";
      jsonViewToggle.style.display = "block";
    }
  }

  jsonViewToggle.addEventListener("click", () => setView("json-view"));
  visualizerViewToggle.addEventListener("click", () =>
    setView("visualizer-view")
  );

  initializePage();
  addEventListener("hashchange", initializePage);

  function initializePage() {
    const fileList = document.querySelector("details#files" as "details")!;
    const iframe = document.querySelector(
      "iframe#source-map-visualizer" as "iframe"
    )!;

    Array.from(jsonView.children).map((child) => jsonView.removeChild(child));

    if (window.location.hash) {
      iframe.src = `https://evanw.github.io/source-map-visualization${window.location.hash}`;
      iframe.style.display = "block";
      fileList.open = false;
      setView("visualizer-view");

      const result = convertHash(window.location.hash.slice(1));
      const code = document.createElement("pre");
      code.textContent = result.code;
      jsonView.appendChild(code);

      const map = document.createElement("pre");
      map.textContent = JSON.stringify(result.map, null, 2);
      jsonView.appendChild(map);
    } else {
      iframe.src = "";
      iframe.style.display = "none";
      fileList.open = true;

      visualizerView.style.display = "none";
      visualizerViewToggle.style.display = "none";
      jsonView.style.display = "none";
      jsonViewToggle.style.display = "none";
    }
  }

  function convertHash(hash: string) {
    let bin = atob(hash);
    const code = readBuffer();
    const map = readBuffer();

    return { code, map: JSON.parse(map) };

    function readBuffer() {
      const zero = bin.indexOf("\0");
      const start = zero + 1;
      const end = start + (0 | parseInt(bin.slice(0, zero)));
      const buffer = decodeURIComponent(bin.slice(start, end));

      bin = bin.slice(end);
      return buffer;
    }
  }
}
/* v8 ignore stop */

export function style() {
  return readFileSync(new URL("./styles.css", import.meta.url), "utf8");
}
