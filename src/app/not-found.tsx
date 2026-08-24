import Link from "next/link";

export const metadata = {
  title: "페이지를 찾을 수 없어요",
};

/**
 * 한국어 404. 이전에는 Next 기본 영문 "This page could not be found"가 노출됐다.
 * global-error와 같은 페이퍼·잉크·바이올렛 카드 문법을 따른다.
 */
export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100svh-65px)] place-items-center bg-paper px-5 py-16 text-ink">
      <div className="w-full max-w-[560px] rounded-3xl border border-ink/20 bg-white p-8 shadow-[0_24px_80px_rgba(10,9,11,0.08)] sm:p-12">
        <p className="mb-3 text-[13px] font-extrabold tracking-[0.12em] text-violet">VIRAL GROUND</p>
        <h1 className="font-display text-[clamp(32px,8vw,52px)] leading-[1.04] tracking-[-0.04em]">
          여기엔 아무것도
          <br />
          없어요.
        </h1>
        <p className="mb-8 mt-5 text-base leading-relaxed text-ink/60" style={{ wordBreak: "keep-all" }}>
          주소가 바뀌었거나 잘못 입력됐을 수 있어요. 아래에서 가려던 곳을 골라주세요.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full bg-violet px-6 font-extrabold text-white"
          >
            홈으로 가기
          </Link>
          <Link
            href="/business"
            className="inline-flex min-h-12 items-center rounded-full border-2 border-ink px-6 font-extrabold text-ink"
          >
            브랜드 문의
          </Link>
          <Link
            href="/creator"
            className="inline-flex min-h-12 items-center rounded-full border-2 border-ink px-6 font-extrabold text-ink"
          >
            크리에이터 지원
          </Link>
        </div>
      </div>
    </div>
  );
}
