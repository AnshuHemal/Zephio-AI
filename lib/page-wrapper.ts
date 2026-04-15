import { BASE_VARIABLES, FONT_VARIABLES } from "./prompt";
import { SECTION_PICKER_SCRIPT } from "./section-picker";
import { PAGE_ANIMATION_SCRIPT } from "./page-animations";

export function getHTMLWrapper(
  htmlContent: string,
  name = "Untitled",
  rootStyles: string,
  pageId: string
) {
  // ── Sanitise AI-generated HTML ──────────────────────────────────────────
  // Strip viewport-unit height classes from the root div and sections to
  // prevent infinite-height bugs in the iframe measurement loop.
  const sanitizedHtml = htmlContent
    .replace(
      /<div([^>]*)class="([^"]*)\b(h-screen|min-h-screen|h-full)\b([^"]*)"([^>]*)>/i,
      '<div$1class="$2$4"$5>'
    )
    .replace(
      /<section([^>]*)class="([^"]*)\bmin-h-screen\b([^"]*)"([^>]*)>/gi,
      '<section$1class="$2$3"$4>'
    );

  // Escape the page ID so it's safe to embed in a JS string literal
  const safePageId = pageId.replace(/['"\\]/g, "\\$&");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${name}</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Iconify -->
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>

  <style type="text/tailwindcss">
    :root {${rootStyles}${FONT_VARIABLES}${BASE_VARIABLES}}

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 100%; }
    body {
      font-family: var(--font-sans);
      background: var(--background);
      color: var(--foreground);
      -webkit-font-smoothing: antialiased;
    }
    #root { width: 100%; min-height: 100vh; }

    /* Hide scrollbars globally — pages are viewed inside iframes */
    * { scrollbar-width: none; -ms-overflow-style: none; }
    *::-webkit-scrollbar { display: none; }
  </style>
</head>
<body>
  <div id="root">
    <div id="content" class="relative">
      ${sanitizedHtml}
    </div>
  </div>

  <!-- ── iframe height reporter ──────────────────────────────────────────── -->
  <script>
    (function () {
      var pageId = '${safePageId}';

      /* Expose pageId so the animation script can re-report height */
      window.__ZEPHIO_PAGE_ID__ = pageId;

      function reportHeight() {
        var root = document.getElementById('root');
        var hasViewportClass = root &&
          (root.className || '').match(/h-(screen|full)|min-h-screen/);
        var h = hasViewportClass
          ? Math.max(900, window.innerHeight)
          : Math.max(
              (root && root.scrollHeight) || 0,
              document.body.scrollHeight,
              900
            );
        parent.postMessage({ type: 'FRAME_HEIGHT', pageId: pageId, height: h }, '*');
      }

      /* Report early and again after fonts + images settle */
      setTimeout(reportHeight, 100);
      setTimeout(reportHeight, 500);
      setTimeout(reportHeight, 1200);

      /* Re-report whenever the document resizes (e.g. responsive preview) */
      if (window.ResizeObserver) {
        new ResizeObserver(reportHeight).observe(document.body);
      }
    })();
  </script>

  <!-- ── Section picker (activated by parent via postMessage) ────────────── -->
  <script>${SECTION_PICKER_SCRIPT}</script>

  <!-- ── Zephio Animation Engine ─────────────────────────────────────────── -->
  <!--
    Self-contained scroll + entrance animation system.
    Respects prefers-reduced-motion. Zero external dependencies.
    Features: page-load fade, scroll-triggered entrances, staggered grids,
    navbar blur-on-scroll, hero parallax, button micro-interactions,
    counter animation, cursor glow (opt-in).
  -->
  <script>${PAGE_ANIMATION_SCRIPT}</script>
</body>
</html>`;
}
