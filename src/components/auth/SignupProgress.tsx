"use client";

import { useLang } from "@/lib/i18n";

interface SignupProgressProps {
  current: 1 | 2 | 3;
  labels: [string, string, string];
}

/** 긴 가입 폼을 세 개의 명확한 작업 단위로 나누는 편집형 진행 표시. */
export default function SignupProgress({ current, labels }: SignupProgressProps) {
  const { t } = useLang();

  return (
    <div className="border-y-2 border-ink py-3" aria-label={t("가입 진행 단계", "Sign-up progress")}>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-violet" aria-live="polite">
        {t(`${current} / 3 단계`, `Step ${current} of 3`)}
      </p>
      <ol className="grid grid-cols-3 gap-px bg-ink" role="list">
        {labels.map((label, index) => {
          const step = (index + 1) as 1 | 2 | 3;
          const active = current === step;
          const complete = current > step;

          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className={`min-h-14 bg-white px-2 py-2.5 sm:px-3 ${active ? "text-white !bg-violet" : complete ? "text-ink" : "text-ink/45"}`}
            >
              <span className="block font-display text-lg leading-none">0{step}</span>
              <span className="mt-1 block text-[11px] font-bold leading-tight sm:text-xs">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
