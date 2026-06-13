import { ImageResponse } from "next/og";

export const alt = "H2 Solutions — Premium veb həllər, SEO və IT konsaltinq";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0d1117 0%, #11161f 60%, #0a2330 100%)",
          color: "#e6edf3",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 242, 254, 0.35) 0%, rgba(0, 242, 254, 0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 153, 179, 0.32) 0%, rgba(0, 153, 179, 0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 14,
              background:
                "linear-gradient(120deg, #00f2fe 0%, #4cf6ff 100%)",
              color: "#001019",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            H2
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
              H2 Solutions
            </div>
            <div style={{ fontSize: 18, color: "#8b96a7" }}>h2solutions.az</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 980,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>Premium səviyyəli&nbsp;</span>
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #00f2fe, #4cf6ff)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              korporativ veb həllər
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#b3bdcc",
              maxWidth: 920,
              lineHeight: 1.35,
            }}
          >
            Next.js və Laravel ilə qurulmuş ultra sürətli, SEO-yönümlü saytlar.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#8b96a7",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>Veb · Mobil · E-ticarət · SEO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#00f2fe",
                boxShadow: "0 0 20px #00f2fe",
              }}
            />
            <span>Bakı, Azərbaycan</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
