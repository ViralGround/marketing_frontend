import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 흰색 VG 마크를 data URL 로 임베드(OG 렌더러는 로컬 경로 대신 인라인 데이터가 필요).
const markSrc =
  "data:image/png;base64," +
  readFileSync(join(process.cwd(), "public", "viral-ground-mark-white.png")).toString("base64");

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a090b",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* 배경 장식 — 전기 보라 편집 면 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            background: "#7331E0",
            transform: "rotate(8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -80,
            width: 440,
            height: 440,
            border: "2px solid rgba(246,245,241,0.26)",
            transform: "rotate(-8deg)",
          }}
        />

        {/* 상단: 로고(흰 VG 마크) + 서비스명 */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* ImageResponse requires a standard img element for an embedded data URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={89} height={56} alt="" style={{ objectFit: "contain" }} />
          <span
            style={{
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Viral Ground
          </span>
        </div>

        {/* 배지 */}
        <div
          style={{
            marginTop: 96,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            borderRadius: 9999,
            background: "#7331E0",
            border: "2px solid #f6f5f1",
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: "#A78BFA",
            }}
          />
          <span style={{ color: "#E9D5FF", fontSize: 22, fontWeight: 500 }}>
            AI SAAS × CREATOR / MANAGED BETA
          </span>
        </div>

        {/* 메인 헤드라인 */}
        <div
          style={{
            marginTop: 28,
            color: "#ffffff",
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: "-2.5px",
            lineHeight: 1.1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>AI PRODUCTS,</span>
          <span style={{ display: "flex" }}>
            CREATOR{" "}
            <span
              style={{
                color: "#A78BFA",
              }}
            >
              FILMS.
            </span>
          </span>
        </div>
      </div>
    ),
    size,
  );
}
