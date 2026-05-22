"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Check, X } from "lucide-react";

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
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      // 닫힐 때 상태 초기화 (다음 오픈 시 깔끔하게)
      const t = setTimeout(() => {
        setForm(INITIAL);
        setSubmitted(false);
        setError("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.brandName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/contact", {
        email: form.email.trim(),
        brandName: form.brandName.trim(),
        contactName: form.contactName.trim() || null,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="consultation-title" className="text-xl font-bold text-foreground">
            가벼운 상담신청
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <p className="font-semibold text-foreground">신청이 접수되었습니다.</p>
            <p className="mt-2 text-sm text-muted">
              평일 기준 1영업일 이내에 입력하신 이메일로 회신드리겠습니다.
            </p>
            <Button type="button" onClick={onClose} className="mt-6">
              확인
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="c-email" className="block text-sm font-medium text-foreground">
                이메일 주소 <span className="text-primary">*</span>
              </label>
              <Input
                id="c-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="c-brand" className="block text-sm font-medium text-foreground">
                브랜드명 <span className="text-primary">*</span>
              </label>
              <Input
                id="c-brand"
                type="text"
                required
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                placeholder="브랜드명을 입력해주세요"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="c-name" className="block text-sm font-medium text-foreground">
                담당자명 <span className="text-faint">(선택)</span>
              </label>
              <Input
                id="c-name"
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="담당자명을 입력해주세요"
                className="mt-1"
              />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" disabled={!valid || submitting} fullWidth>
              {submitting ? "전송 중..." : "상담 신청하기"}
            </Button>

            <p className="text-center text-xs text-faint">
              제출된 정보는 상담 회신 목적으로만 사용됩니다.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
