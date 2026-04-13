import { ImageResponse } from "next/og";
import { APP_URL } from "@/lib/metadata";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slugId: string }> };

export default async function PreviewOgImage({ params }: Props) {
  const { slugId } = await params;

  let projectTitle = "Untitled Project";
  let pageCount = 0;

  try {
    const res = await fetch(`${APP_URL}/api/preview/${slugId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      projectTitle = data.title || projectTitle;
      pageCount = data.pages?.length ?? 0;
    }
  } catch {
    // fall through to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#0f0f0f",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(220,80,40,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(220,80,40,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top bar — Zephio branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "40px 56px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #dc5028 0%, #b83d1a 100%)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "-0.5px",
            }}
          >
            Zephio
            <span style={{ color: "#dc5028" }}>.</span>
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 56px",
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#dc5028",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            AI-Generated Design
          </div>

          {/* Project title */}
          <div
            style={{
              fontSize: projectTitle.length > 40 ? "44px" : "58px",
              fontWeight: "800",
              color: "white",
              letterSpacing: "-2px",
              lineHeight: "1.1",
              maxWidth: "900px",
              marginBottom: "28px",
            }}
          >
            {projectTitle}
          </div>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {pageCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                {pageCount} page{pageCount !== 1 ? "s" : ""}
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "100px",
                border: "1px solid rgba(220,80,40,0.3)",
                background: "rgba(220,80,40,0.08)",
                color: "rgba(220,80,40,0.9)",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              Built with Zephio
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 56px 36px",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "14px",
            }}
          >
            zephio.app
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: "14px",
            }}
          >
            AI that designs. You that decides.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
