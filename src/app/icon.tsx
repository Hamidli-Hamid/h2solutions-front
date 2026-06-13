import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          borderRadius: 6,
        }}
      >
        H2
      </div>
    ),
    { ...size },
  );
}
