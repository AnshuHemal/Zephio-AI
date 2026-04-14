import { getHTMLWrapper } from "./page-wrapper";
import { PageType } from "@/types/project";

const WATERMARK_HTML = `
<a href="https://zephio.app" target="_blank" rel="noopener" style="
  position:fixed;bottom:16px;right:16px;z-index:99999;
  display:flex;align-items:center;gap:6px;
  background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,0.12);
  border-radius:999px;padding:5px 12px 5px 8px;
  font-family:system-ui,sans-serif;font-size:11px;font-weight:600;
  color:#fff;letter-spacing:0.01em;text-decoration:none;
  box-shadow:0 2px 12px rgba(0,0,0,0.3);">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round"/></svg>
  Made with Zephio
</a>`.trim();

/**
 * Injects the watermark badge into an HTML string.
 * Inserts just before </body> so it renders on top of all page content.
 */
function injectWatermark(html: string): string {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${WATERMARK_HTML}\n</body>`);
  }
  return html + WATERMARK_HTML;
}

/**
 * Downloads a single page as a self-contained .html file.
 * @param isPro - when true, exports without watermark
 */
export function downloadPage(page: PageType, isPro = false): void {
  let html = getHTMLWrapper(page.htmlContent, page.name, page.rootStyles, page.id);
  if (!isPro) html = injectWatermark(html);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(page.name)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads all pages as individual .html files inside a .zip archive.
 * @param isPro - when true, exports without watermark
 */
export async function downloadAllPages(
  pages: PageType[],
  projectTitle: string,
  isPro = false
): Promise<void> {
  if (pages.length === 0) return;

  try {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(slugify(projectTitle) || "zephio-project")!;

    pages.forEach((page) => {
      let html = getHTMLWrapper(page.htmlContent, page.name, page.rootStyles, page.id);
      if (!isPro) html = injectWatermark(html);
      folder.file(`${slugify(page.name)}.html`, html);
    });

    const indexHtml = buildIndexPage(pages, projectTitle);
    folder.file("index.html", indexHtml);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(projectTitle) || "zephio-project"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    pages.forEach((page, i) => {
      setTimeout(() => downloadPage(page, isPro), i * 300);
    });
  }
}

function buildIndexPage(pages: PageType[], projectTitle: string): string {
  const links = pages
    .map((p) => `  <li><a href="./${slugify(p.name)}.html">${p.name}</a></li>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${projectTitle} — Index</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 80px auto; padding: 0 24px; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    a { color: #6366f1; text-decoration: none; font-size: 1rem; }
    a:hover { text-decoration: underline; }
    p { color: #6b7280; font-size: 0.875rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>${projectTitle}</h1>
  <ul>
${links}
  </ul>
  <p>Built with <a href="https://zephio.app">Zephio</a> — AI that designs. You that decides.</p>
</body>
</html>`;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
