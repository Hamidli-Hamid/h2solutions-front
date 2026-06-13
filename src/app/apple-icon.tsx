import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(120deg, #00f2fe 0%, #4cf6ff 100%)",
          color: "#001019",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          borderRadius: 36,
        }}
      >
        H2
      </div>
    ),
    { ...size },
  );
}
