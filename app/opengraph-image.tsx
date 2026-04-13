import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Zephio — AI that designs. You that decides.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Radial glow — top center */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(220,80,40,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Bottom right glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(220,80,40,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #dc5028 0%, #b83d1a 100%)",
            marginBottom: "28px",
            boxShadow: "0 0 40px rgba(220,80,40,0.4)",
          }}
        >
          {/* Sparkle icon — simplified SVG */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
            <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />
            <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "-2px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          Zephio
          <span style={{ color: "#dc5028" }}>.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: "500",
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "-0.5px",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: "1.4",
          }}
        >
          AI that designs. You that decides.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["AI-powered", "Multi-page", "Export ready", "No code"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.55)",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "rgba(255,255,255,0.25)",
            fontSize: "14px",
            letterSpacing: "0.5px",
          }}
        >
          zephio.app
        </div>
      </div>
    ),
    { ...size }
  );
}
