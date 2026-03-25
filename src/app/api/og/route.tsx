import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "\u0628\u0627\u062f\u0644\u0632 - Badelz";
  const subtitle =
    searchParams.get("subtitle") || "\u0627\u062d\u062c\u0632 \u0643\u0648\u0631\u062a \u0628\u0627\u062f\u0644 \u0641\u064a \u0645\u0635\u0631";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0f1a",
          padding: "60px 80px",
        }}
      >
        {/* Brand name */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#c8ff00",
            letterSpacing: "0.15em",
            marginBottom: 24,
          }}
        >
          BADELZ \u0628\u0627\u062f\u0644\u0632
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 80,
            height: 4,
            backgroundColor: "#c8ff00",
            borderRadius: 2,
            marginBottom: 40,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 900,
            marginBottom: 20,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            fontWeight: 600,
            color: "#c8ff00",
            letterSpacing: "0.05em",
          }}
        >
          badelz.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
