import { getHTMLWrapper } from "./page-wrapper";
import { PageType } from "@/types/project";

/**
 * Downloads a single page as a self-contained .html file.
 */
export function downloadPage(page: PageType): void {
  const html = getHTMLWrapper(page.htmlContent, page.name, page.rootStyles, page.id);
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
 * Uses the native File System Access API with a fallback to sequential downloads.
 */
export async function downloadAllPages(
  pages: PageType[],
  projectTitle: string
): Promise<void> {
  if (pages.length === 0) return;

  // Try to use JSZip if available (loaded dynamically to keep bundle small)
  try {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(slugify(projectTitle) || "zephio-project")!;

    pages.forEach((page) => {
      const html = getHTMLWrapper(page.htmlContent, page.name, page.rootStyles, page.id);
      folder.file(`${slugify(page.name)}.html`, html);
    });

    // Add a simple index.html that links to all pages
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
    // Fallback: download each page individually
    pages.forEach((page, i) => {
      setTimeout(() => downloadPage(page), i * 300);
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
