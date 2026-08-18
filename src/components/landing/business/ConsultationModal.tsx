"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import api from "@/lib/api";
import { trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { PRIVACY_VERSION } from "@/lib/legal/privacy";
import { groundStyles } from "@/components/landing/ground/PublicGround";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  email: string;
  brandName: string;
  contactName: string;
}

const INITIAL: FormState = { email: "", brandName: "", contactName: "" };

export default function ConsultationModal({ open, onClose }: Props) {
  const { t } = useLang();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const dialogRef = useDialogA11y<HTMLDivElement>(open, onClose);

  useEffect(() => {
    if (!open) {
      const resetTimer = setTimeout(() => {
        setForm(INITIAL);
        setSubmitted(false);
        setError("");
        setPrivacyAgreed(false);
      }, 200);
      return () => clearTimeout(resetTimer);
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.brandName.trim().length > 0 &&
    privacyAgreed;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || submitting) return;
    setError("");
    setSubmitting(true);
    trackEvent("contact_submit", {});
    try {
      await api.post("/contact", {
        email: form.email.trim(),
        brandName: form.brandName.trim(),
        contactName: form.contactName.trim() || null,
        privacyConsent: privacyAgreed,
        privacyVersion: PRIVACY_VERSION,
        website: "",
      });
      trackEvent("contact_success", {});
      setSubmitted(true);
    } catch (caught: unknown) {
      const response = (caught as { response?: { status?: number; data?: { message?: string } } }).response;
      setError(
        response?.data?.message ||
          t(
            "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            "Something went wrong with your request. Please try again shortly.",
          ),
      );
      trackEvent("contact_fail", { status: response?.status ?? 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-title"
      className={groundStyles.sheetBackdrop}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`${groundStyles.sheet} ${groundStyles.sheetCompact}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={groundStyles.sheetHeader}>
          <div>
            <h2 id="consultation-title">{t("가벼운 상담신청", "Request a consultation")}</h2>
            <p>{t("제품과 목표부터 알려주세요", "Start with your product and goal")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("닫기", "Close")} className={groundStyles.sheetClose}>
            <X aria-hidden="true" />
          </button>
        </header>

        <div className={groundStyles.sheetBody}>
          {submitted ? (
            <div className={groundStyles.sheetSuccess}>
              <Check aria-hidden="true" size={32} strokeWidth={2.4} />
              <strong>{t("신청이 접수되었습니다", "Your request has been received")}</strong>
              <p>
                {t(
                  "평일 기준 1영업일 이내에 입력하신 이메일로 회신드리겠습니다.",
                  "We'll reply to the email you entered within one business day.",
                )}
              </p>
            </div>
          ) : (
            <form id="consultation-form" className={groundStyles.sheetForm} onSubmit={handleSubmit}>
              <div className={groundStyles.sheetField}>
                <label htmlFor="c-email">{t("이메일 주소", "Email address")} *</label>
                <input
                  id="c-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="example@email.com"
                />
              </div>

              <div className={groundStyles.sheetField}>
                <label htmlFor="c-brand">{t("브랜드명", "Brand name")} *</label>
                <input
                  id="c-brand"
                  type="text"
                  required
                  value={form.brandName}
                  onChange={(event) => setForm({ ...form, brandName: event.target.value })}
                  placeholder={t("브랜드명을 입력해주세요", "Enter your brand name")}
                />
              </div>

              <div className={groundStyles.sheetField}>
                <label htmlFor="c-name">{t("담당자명 (선택)", "Contact name (optional)")}</label>
                <input
                  id="c-name"
                  type="text"
                  value={form.contactName}
                  onChange={(event) => setForm({ ...form, contactName: event.target.value })}
                  placeholder={t("담당자명을 입력해주세요", "Enter the contact name")}
                />
              </div>

              <label className={groundStyles.sheetConsent}>
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(event) => setPrivacyAgreed(event.target.checked)}
                  required
                />
                <span>
                  {t(
                    "상담 회신을 위한 개인정보 수집·이용에 동의합니다. ",
                    "I agree to the collection and use of my information for this consultation. ",
                  )}
                  <Link href="/privacy" target="_blank" className={groundStyles.sheetLink}>
                    {t("개인정보처리방침", "Privacy policy")}
                  </Link>
                </span>
              </label>

              {error && <p role="alert" className={groundStyles.sheetError}>{error}</p>}
            </form>
          )}
        </div>

        <footer className={groundStyles.sheetFooter}>
          <button type="button" className={groundStyles.actionSecondary} onClick={onClose}>
            {submitted ? t("확인", "Confirm") : t("취소", "Cancel")}
          </button>
          {!submitted && (
            <button
              type="submit"
              form="consultation-form"
              disabled={!valid || submitting}
              className={groundStyles.actionPrimary}
            >
              {submitting ? t("전송 중...", "Sending...") : t("상담 신청하기", "Request consultation")}
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
