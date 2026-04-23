import { ImageResponse } from "next/og";
import { BrandLogo } from "@/lib/brandLogo";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1025 0%, #5B21B6 55%, #A78BFA 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
        }}
      >
        <BrandLogo size={32} />
      </div>
    ),
    size,
  );
}
