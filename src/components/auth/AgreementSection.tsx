"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TERMS_BODY, TERMS_TITLE } from "@/lib/legal/terms";
import { PRIVACY_BODY, PRIVACY_TITLE } from "@/lib/legal/privacy";
import { THIRD_PARTY_BODY, THIRD_PARTY_TITLE } from "@/lib/legal/thirdParty";
import { MARKETING_BODY, MARKETING_TITLE } from "@/lib/legal/marketing";

export interface AgreementValue {
  age14: boolean;
  terms: boolean;
  privacy: boolean;
  thirdParty: boolean;
  marketing: boolean;
}

export const EMPTY_AGREEMENT: AgreementValue = {
  age14: false,
  terms: false,
  privacy: false,
  thirdParty: false,
  marketing: false,
};

interface Props {
  role: "CREATOR" | "COMPANY";
  value: AgreementValue;
  onChange: (next: AgreementValue) => void;
}

export default function AgreementSection({ role, value, onChange }: Props) {
  const items = [
    { key: "age14" as const, label: "만 14세 이상입니다", required: true, body: null, title: null },
    { key: "terms" as const, label: "서비스 이용약관 동의", required: true, body: TERMS_BODY, title: TERMS_TITLE },
    { key: "privacy" as const, label: "개인정보 수집·이용 동의", required: true, body: PRIVACY_BODY, title: PRIVACY_TITLE },
    ...(role === "CREATOR"
      ? [{ key: "thirdParty" as const, label: "개인정보 제3자 제공 동의", required: true, body: THIRD_PARTY_BODY, title: THIRD_PARTY_TITLE }]
      : []),
    { key: "marketing" as const, label: "마케팅 정보 수신 동의", required: false, body: MARKETING_BODY, title: MARKETING_TITLE },
  ];

  const requiredKeys = items.filter((i) => i.required).map((i) => i.key);
  const allChecked = items.every((i) => value[i.key]);

  const toggleAll = (next: boolean) => {
    onChange({
      age14: next,
      terms: next,
      privacy: next,
      thirdParty: role === "CREATOR" ? next : value.thirdParty,
      marketing: next,
    });
  };

  const toggleOne = (key: keyof AgreementValue, next: boolean) => {
    onChange({ ...value, [key]: next });
  };

  const [openModal, setOpenModal] = useState<{ title: string; body: string } | null>(null);

  return (
    <section className="space-y-3 border-t border-line pt-6">
      <h2 className="text-sm font-semibold text-muted">약관 동의</h2>

      <label className="flex cursor-pointer items-center gap-2 rounded border border-line-strong px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(e) => toggleAll(e.target.checked)}
          className="h-4 w-4"
        />
        전체 동의 (선택 항목 포함)
      </label>

      <ul className="space-y-2 px-1">
        {items.map((item) => (
          <li key={item.key} className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-content-soft">
              <input
                type="checkbox"
                checked={value[item.key]}
                onChange={(e) => toggleOne(item.key, e.target.checked)}
                className="h-4 w-4"
              />
              <span>
                <span className={item.required ? "text-foreground" : "text-muted"}>
                  ({item.required ? "필수" : "선택"})
                </span>{" "}
                {item.label}
              </span>
            </label>
            {item.body && item.title && (
              <button
                type="button"
                onClick={() => setOpenModal({ title: item.title, body: item.body })}
                className="text-xs text-muted underline hover:text-foreground"
              >
                보기
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-faint">필수 항목({requiredKeys.length}개)에 모두 동의해야 가입할 수 있습니다.</p>

      {openModal && (
        <LegalModal
          title={openModal.title}
          body={openModal.body}
          onClose={() => setOpenModal(null)}
        />
      )}
    </section>
  );
}

function LegalModal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre className="whitespace-pre-wrap break-words text-xs leading-6 text-content-soft">
            {body}
          </pre>
        </div>
        <div className="flex justify-end border-t border-line px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
