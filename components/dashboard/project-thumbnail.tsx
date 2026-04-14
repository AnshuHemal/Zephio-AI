"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { FileStack } from "lucide-react";
import { extractPalette, buildThumbnailGradient, type ThumbnailPalette } from "@/lib/thumbnail";

type ThumbnailData = {
  id: string;
  name: string;
  rootStyles: string;
};

type Props = {
  thumbnail: ThumbnailData | null;
  /** "grid" renders a taller card thumbnail; "list" renders a small square */
  variant?: "grid" | "list";
  className?: string;
};

export default function ProjectThumbnail({ thumbnail, variant = "grid", className }: Props) {
  const palette = useMemo(
    () => (thumbnail ? extractPalette(thumbnail.rootStyles) : null),
    [thumbnail?.rootStyles]
  );

  if (!palette || !thumbnail) {
    return <EmptyThumbnail variant={variant} className={className} />;
  }

  return variant === "grid" ? (
    <GridThumbnail palette={palette} name={thumbnail.name} className={className} />
  ) : (
    <ListThumbnail palette={palette} name={thumbnail.name} className={className} />
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyThumbnail({ variant, className }: { variant: "grid" | "list"; className?: string }) {
  if (variant === "list") {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted ${className ?? ""}`}>
        <FileStack className="size-3.5 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-muted ${className ?? ""}`}>
      <FileStack className="size-7 sm:size-8 text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground/50">No pages yet</p>
    </div>
  );
}

// ── Grid thumbnail ────────────────────────────────────────────────────────────
function GridThumbnail({
  palette,
  name,
  className,
}: {
  palette: ThumbnailPalette;
  name: string;
  className?: string;
}) {
  const gradient = buildThumbnailGradient(palette);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className ?? ""}`}
      style={{ background: gradient }}
    >
      {/* Nav bar mockup */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2"
        style={{
          background: `color-mix(in oklch, ${palette.background} 85%, transparent)`,
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid color-mix(in oklch, ${palette.border} 60%, transparent)`,
        }}
      >
        {/* Logo dot */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: palette.primary }}
          />
          <div
            className="h-1.5 w-10 rounded-full"
            style={{ background: `color-mix(in oklch, ${palette.foreground} 25%, transparent)` }}
          />
        </div>
        {/* Nav links */}
        <div className="flex items-center gap-2">
          {[14, 10, 12].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: w,
                background: `color-mix(in oklch, ${palette.foreground} 20%, transparent)`,
              }}
            />
          ))}
        </div>
        {/* CTA pill */}
        <div
          className="h-3 w-8 rounded-full"
          style={{ background: palette.primary }}
        />
      </div>

      {/* Hero section */}
      <div className="absolute top-9 left-0 right-0 flex flex-col items-center gap-2 px-4 pt-3">
        {/* Badge */}
        <div
          className="h-2 w-14 rounded-full"
          style={{
            background: `color-mix(in oklch, ${palette.primary} 20%, transparent)`,
            border: `1px solid color-mix(in oklch, ${palette.primary} 35%, transparent)`,
          }}
        />
        {/* Headline */}
        <div className="flex flex-col items-center gap-1 w-full">
          <div
            className="h-3 w-3/4 rounded-full"
            style={{ background: `color-mix(in oklch, ${palette.foreground} 70%, transparent)` }}
          />
          <div
            className="h-3 w-1/2 rounded-full"
            style={{ background: `color-mix(in oklch, ${palette.foreground} 50%, transparent)` }}
          />
        </div>
        {/* Subheadline */}
        <div className="flex flex-col items-center gap-1 w-full mt-0.5">
          {[60, 75, 50].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full"
              style={{
                width: `${w}%`,
                background: `color-mix(in oklch, ${palette.foreground} 22%, transparent)`,
              }}
            />
          ))}
        </div>
        {/* CTA buttons */}
        <div className="flex items-center gap-2 mt-1">
          <div
            className="h-4 w-14 rounded-full"
            style={{ background: palette.primary }}
          />
          <div
            className="h-4 w-12 rounded-full"
            style={{
              background: "transparent",
              border: `1px solid color-mix(in oklch, ${palette.border} 80%, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Feature cards row */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 px-2 pb-2">
        {[palette.primary, palette.secondary, palette.accent].map((color, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 rounded-lg p-2 flex flex-col gap-1"
            style={{
              background: `color-mix(in oklch, ${palette.background} 80%, ${color} 20%)`,
              border: `1px solid color-mix(in oklch, ${palette.border} 50%, transparent)`,
            }}
          >
            <div
              className="h-2 w-2 rounded-sm"
              style={{ background: `color-mix(in oklch, ${palette.primary} 60%, transparent)` }}
            />
            <div
              className="h-1.5 w-full rounded-full"
              style={{ background: `color-mix(in oklch, ${palette.foreground} 30%, transparent)` }}
            />
            <div
              className="h-1.5 w-3/4 rounded-full"
              style={{ background: `color-mix(in oklch, ${palette.foreground} 18%, transparent)` }}
            />
          </motion.div>
        ))}
      </div>

      {/* Subtle page name label */}
      <div
        className="absolute bottom-2 right-2 rounded-full px-1.5 py-0.5 text-[8px] font-medium leading-none opacity-60"
        style={{
          background: `color-mix(in oklch, ${palette.background} 70%, transparent)`,
          color: palette.foreground,
          backdropFilter: "blur(4px)",
        }}
      >
        {name}
      </div>
    </div>
  );
}

// ── List thumbnail ────────────────────────────────────────────────────────────
function ListThumbnail({
  palette,
  name,
  className,
}: {
  palette: ThumbnailPalette;
  name: string;
  className?: string;
}) {
  const gradient = buildThumbnailGradient(palette);

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-lg ${className ?? ""}`}
      style={{ background: gradient }}
    >
      {/* Mini nav strip */}
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          background: `color-mix(in oklch, ${palette.background} 80%, transparent)`,
          borderBottom: `1px solid color-mix(in oklch, ${palette.border} 40%, transparent)`,
        }}
      />
      {/* Primary color accent */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full"
        style={{ background: palette.primary }}
      />
      {/* Content lines */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex flex-col gap-0.5">
        <div
          className="h-1 w-full rounded-full"
          style={{ background: `color-mix(in oklch, ${palette.foreground} 25%, transparent)` }}
        />
        <div
          className="h-1 w-2/3 rounded-full"
          style={{ background: `color-mix(in oklch, ${palette.foreground} 15%, transparent)` }}
        />
      </div>
    </div>
  );
}
