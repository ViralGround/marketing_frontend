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
          background:
            "linear-gradient(135deg, #1a1025 0%, #2b1055 45%, #5B21B6 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* 배경 장식 — 라이트 원 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(167,139,250,0.35) 0%, rgba(167,139,250,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -80,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0) 70%)",
          }}
        />

        {/* 상단: 로고(흰 VG 마크) + 서비스명 */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
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
            첫 영상 업로드 시 3만원 즉시 지급
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
          <span>영상 하나로 시작하는</span>
          <span>
            나만의{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #A78BFA 0%, #F5F3FF 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              부업
            </span>
          </span>
        </div>
      </div>
    ),
    size,
  );
}
