"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { AGE14_BODY, AGE14_TITLE } from "@/lib/legal/age14";
import { TERMS_BODY, TERMS_TITLE } from "@/lib/legal/terms";
import { PRIVACY_BODY, PRIVACY_TITLE } from "@/lib/legal/privacy";
import { THIRD_PARTY_BODY, THIRD_PARTY_TITLE } from "@/lib/legal/thirdParty";
import { MARKETING_BODY, MARKETING_TITLE } from "@/lib/legal/marketing";
import { useDialogA11y } from "@/hooks/useDialogA11y";

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
  const { t } = useLang();
  const items = [
    { key: "age14" as const, label: t("만 14세 이상입니다", "I am 14 years or older"), required: true, body: AGE14_BODY, title: AGE14_TITLE },
    { key: "terms" as const, label: t("서비스 이용약관 동의", "Agree to the Terms of Service"), required: true, body: TERMS_BODY, title: TERMS_TITLE },
    { key: "privacy" as const, label: t("개인정보 수집·이용 동의", "Agree to the collection and use of personal information"), required: true, body: PRIVACY_BODY, title: PRIVACY_TITLE },
    ...(role === "CREATOR"
      ? [{ key: "thirdParty" as const, label: t("개인정보 제3자 제공 동의", "Agree to the provision of personal information to third parties"), required: true, body: THIRD_PARTY_BODY, title: THIRD_PARTY_TITLE }]
      : []),
    { key: "marketing" as const, label: t("마케팅 정보 수신 동의", "Agree to receive marketing information"), required: false, body: MARKETING_BODY, title: MARKETING_TITLE },
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
      <h2 className="text-sm font-semibold text-muted">{t("약관 동의", "Terms agreement")}</h2>

      <label className="flex cursor-pointer items-center gap-2 rounded border border-line-strong px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(e) => toggleAll(e.target.checked)}
          className="h-4 w-4"
        />
        {t("전체 동의 (선택 항목 포함)", "Agree to all (including optional items)")}
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
                  ({item.required ? t("필수", "Required") : t("선택", "Optional")})
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
                {t("보기", "View")}
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="text-xs text-faint">
        {t(
          `필수 항목(${requiredKeys.length}개)에 모두 동의해야 가입할 수 있습니다.`,
          `You must agree to all ${requiredKeys.length} required items to sign up.`,
        )}
      </p>

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
  const { t } = useLang();
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = useDialogA11y<HTMLDivElement>(true, onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 id={titleId} className="text-base font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted transition-colors hover:text-foreground"
            aria-label={t("닫기", "Close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre id={bodyId} className="whitespace-pre-wrap break-words text-xs leading-6 text-content-soft">
            {body}
          </pre>
        </div>
        <div className="flex justify-end border-t border-line px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-700"
          >
            {t("확인", "Confirm")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
