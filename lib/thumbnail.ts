/**
 * Thumbnail utilities
 *
 * Extracts design tokens from a page's rootStyles string and produces
 * a structured palette used to render a CSS-only thumbnail — no iframe,
 * no live HTML, zero memory overhead.
 */

export type ThumbnailPalette = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  muted: string;
  border: string;
  accent: string;
  /** Detected font family name (first word only, safe for CSS) */
  fontFamily: string;
};

const DEFAULT_PALETTE: ThumbnailPalette = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  primary: "#6366f1",
  primaryForeground: "#ffffff",
  secondary: "#f4f4f5",
  muted: "#f4f4f5",
  border: "#e4e4e7",
  accent: "#f4f4f5",
  fontFamily: "Inter",
};

const DARK_DEFAULT_PALETTE: ThumbnailPalette = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  primary: "#6366f1",
  primaryForeground: "#ffffff",
  secondary: "#27272a",
  muted: "#18181b",
  border: "#27272a",
  accent: "#27272a",
  fontFamily: "Inter",
};

/** Parse a single CSS variable value from a rootStyles string */
function extractVar(rootStyles: string, varName: string): string | null {
  // Matches: --varName: value; (with optional whitespace)
  const re = new RegExp(`--${varName}\\s*:\\s*([^;]+);`);
  const match = rootStyles.match(re);
  return match ? match[1].trim() : null;
}

/**
 * Convert an oklch() / hsl() / hex / rgb value to a usable CSS color string.
 * We pass oklch and hsl through as-is (modern browsers handle them fine).
 * Hex and rgb are returned unchanged.
 */
function normalizeColor(raw: string): string {
  if (!raw) return "";
  const v = raw.trim();
  // Already a valid CSS color token
  if (
    v.startsWith("#") ||
    v.startsWith("rgb") ||
    v.startsWith("hsl") ||
    v.startsWith("oklch") ||
    v.startsWith("color(")
  ) {
    return v;
  }
  // Bare hex without #
  if (/^[0-9a-fA-F]{3,8}$/.test(v)) return `#${v}`;
  return v;
}

/** Detect whether a palette is dark-mode based on the background value */
function isDarkBackground(bg: string): boolean {
  // oklch with low L value → dark
  const oklchMatch = bg.match(/oklch\(\s*([\d.]+)/);
  if (oklchMatch) return parseFloat(oklchMatch[1]) < 0.35;

  // hsl with low L value
  const hslMatch = bg.match(/hsl[a]?\(\s*[\d.]+\s*,\s*[\d.]+%?\s*,\s*([\d.]+)%?/);
  if (hslMatch) return parseFloat(hslMatch[1]) < 35;

  // hex
  if (bg.startsWith("#")) {
    const hex = bg.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.35;
  }

  return false;
}

/**
 * Extract a ThumbnailPalette from a page's rootStyles CSS variable block.
 * Falls back gracefully for any missing variable.
 */
export function extractPalette(rootStyles: string): ThumbnailPalette {
  if (!rootStyles?.trim()) return DEFAULT_PALETTE;

  const bg = normalizeColor(extractVar(rootStyles, "background") ?? "");
  const defaults = bg && isDarkBackground(bg) ? DARK_DEFAULT_PALETTE : DEFAULT_PALETTE;

  const get = (name: string, fallback: string) =>
    normalizeColor(extractVar(rootStyles, name) ?? "") || fallback;

  // Font: --font-sans or --font-heading
  const fontRaw =
    extractVar(rootStyles, "font-sans") ??
    extractVar(rootStyles, "font-heading") ??
    "";
  const fontFamily = fontRaw
    ? fontRaw.replace(/['"]/g, "").split(",")[0].trim()
    : defaults.fontFamily;

  return {
    background: get("background", defaults.background),
    foreground: get("foreground", defaults.foreground),
    primary: get("primary", defaults.primary),
    primaryForeground: get("primary-foreground", defaults.primaryForeground),
    secondary: get("secondary", defaults.secondary),
    muted: get("muted", defaults.muted),
    border: get("border", defaults.border),
    accent: get("accent", defaults.accent),
    fontFamily,
  };
}

/**
 * Returns a deterministic "shimmer" gradient for a project based on its
 * primary and background colors — used as the thumbnail background.
 */
export function buildThumbnailGradient(palette: ThumbnailPalette): string {
  return `radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklch, ${palette.primary} 18%, transparent), transparent 70%), ${palette.background}`;
}
