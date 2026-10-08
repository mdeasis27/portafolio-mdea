import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "#888",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 600,
              fontFamily: "monospace",
              color: "#ccc",
            }}
          >
            MdA
          </div>
          <span>Finance · Operations · Applied AI</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            Finance and operations leader who builds AI.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              color: "#999",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            I turn business decisions into working software. 21 live demos, open source, no login.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#888",
          }}
        >
          <span style={{ color: "#fafafa", fontWeight: 600 }}>
            {site.name}
          </span>
          <span style={{ fontFamily: "monospace" }}>portafolio-mdea.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
