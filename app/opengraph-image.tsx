import { ImageResponse } from "next/og";

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
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#0d0c0a",
          backgroundImage:
            "radial-gradient(circle at 75% 50%, #1c1814 0%, #0d0c0a 65%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 34,
            color: "#e6dfd0",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#d62839" }} />
          Terror en Corto
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            lineHeight: 1.15,
            color: "#e6dfd0",
          }}
        >
          <div style={{ display: "flex" }}>Lo que viste</div>
          <div style={{ display: "flex" }}>
            no se va a <span style={{ color: "#d62839", marginLeft: 20 }}>olvidar.</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a39b89",
            marginTop: 32,
            maxWidth: 820,
          }}
        >
          Testimonios reales, leyendas urbanas y encuentros sin explicación.
        </div>
      </div>
    ),
    { ...size }
  );
}
