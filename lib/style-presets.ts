export type StylePreset = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  instruction: string;
};

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "minimal",
    label: "Minimal",
    emoji: "◻️",
    description: "Clean, lots of whitespace, subtle borders",
    instruction:
      "STYLE PRESET — MINIMAL: Use a clean, ultra-minimal aesthetic. Generous whitespace, light neutral palette (white/off-white background, near-black text), very subtle borders, no gradients, no shadows. Typography-first hierarchy. Think Notion, Linear, or Apple.com.",
  },
  {
    id: "bold",
    label: "Bold",
    emoji: "⚡",
    description: "High contrast, strong typography, vivid colors",
    instruction:
      "STYLE PRESET — BOLD: Use a high-impact, bold aesthetic. Strong typographic hierarchy with oversized headlines (text-8xl+), high-contrast color blocking, vivid saturated primary colors, thick borders or no borders, confident CTAs. Think Stripe, Vercel, or Loom.",
  },
  {
    id: "dark",
    label: "Dark",
    emoji: "🌑",
    description: "Dark mode, glows, glassmorphism",
    instruction:
      "STYLE PRESET — DARK: Use a premium dark mode aesthetic. Deep charcoal or near-black background (#0a0a0a or similar), vibrant accent colors with glow effects using rgba, glassmorphic cards with backdrop-blur, subtle mesh gradients, luminous primary buttons. Think Linear, Raycast, or Vercel dark mode.",
  },
  {
    id: "corporate",
    label: "Corporate",
    emoji: "🏢",
    description: "Professional, trustworthy, structured",
    instruction:
      "STYLE PRESET — CORPORATE: Use a professional, enterprise-grade aesthetic. Structured grid layouts, conservative blue/navy/slate color palette, clear information hierarchy, trust signals, clean sans-serif typography, subtle shadows, no flashy effects. Think Salesforce, HubSpot, or IBM.",
  },
  {
    id: "playful",
    label: "Playful",
    emoji: "🎨",
    description: "Colorful, rounded, fun and energetic",
    instruction:
      "STYLE PRESET — PLAYFUL: Use a fun, energetic aesthetic. Bright multi-color palette, large rounded corners (border-radius: 24px+), playful illustrations or emoji, bouncy card layouts, gradient backgrounds, friendly copy tone. Think Notion's marketing site, Duolingo, or Framer.",
  },
];

export function getPresetById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}
