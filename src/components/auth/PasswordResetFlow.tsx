"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { trackEvent } from "@/lib/gtag";

type Step = "request" | "confirm" | "done";

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function responseOf(err: unknown) {
  return typeof err === "object" && err !== null && "response" in err
    ? (err as { response?: { status?: number; data?: { code?: string; message?: string } } }).response
    : undefined;
}

/**
 * 이메일 코드 기반 비밀번호 재설정 3단계.
 * 백엔드는 계정 존재 여부를 응답으로 구분하지 않으므로(열거 방지)
 * 발송 단계 안내문도 "가입된 이메일이라면"으로 같은 톤을 유지한다.
 */
export default function PasswordResetFlow() {
  const { t } = useLang();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!expiresAt) return;

    const tick = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expiresAt]);

  const requestCode = async () => {
    const requestedEmail = email.trim();
    if (!requestedEmail) {
      setError(t("이메일을 입력해주세요", "Please enter your email"));
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post<{ expiresAt: string; message: string }>(
        "/auth/password/request-code",
        { email: requestedEmail },
      );
      setStep("confirm");
      setCode("");
      setExpiresAt(new Date(data.expiresAt).getTime());
      setNotice(
        data.message ??
          t("가입된 이메일이라면 재설정 코드를 발송했습니다", "If the email is registered, we've sent a reset code"),
      );
      trackEvent("password_reset_request", {});
    } catch (err: unknown) {
      const response = responseOf(err);
      if (response?.status === 429) {
        setError(t("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", "Too many requests. Please try again shortly."));
      } else {
        setError(response?.data?.message ?? t("코드 발송에 실패했습니다", "Failed to send the code"));
      }
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setError(t("6자리 코드를 입력해주세요", "Please enter the 6-digit code"));
      return;
    }
    if (newPassword.length < 12) {
      setError(t("비밀번호는 12자 이상이어야 합니다", "Password must be at least 12 characters"));
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      await api.post("/auth/password/reset", {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      setStep("done");
      setExpiresAt(null);
      trackEvent("password_reset_success", {});
    } catch (err: unknown) {
      const response = responseOf(err);
      const codeName = response?.data?.code;
      if (codeName === "VERIFICATION_CODE_EXPIRED" || codeName === "VERIFICATION_ATTEMPTS_EXCEEDED") {
        setError(
          response?.data?.message ??
            t("코드를 다시 요청해주세요", "Please request a new code"),
        );
      } else if (response?.status === 429) {
        setError(t("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", "Too many requests. Please try again shortly."));
      } else {
        setError(response?.data?.message ?? t("재설정에 실패했습니다", "Reset failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "block min-h-12 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-foreground placeholder-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  if (step === "done") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          {t(
            "비밀번호가 변경되었습니다. 보안을 위해 기존 로그인은 모두 종료되었어요.",
            "Your password has been changed. For security, all existing sessions were signed out.",
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login/creator"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {t("크리에이터 로그인", "Creator log in")}
          </Link>
          <Link
            href="/login/company"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border-2 border-ink px-6 font-semibold text-ink"
          >
            {t("브랜드 로그인", "Brand log in")}
          </Link>
        </div>
      </div>
    );
  }

  if (step === "request") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
        className="space-y-4"
      >
        {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-content-soft">
            {t("가입한 이메일", "Account email")}
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="min-h-12 w-full rounded-full bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? t("발송 중...", "Sending...") : t("재설정 코드 받기", "Send reset code")}
        </button>
        <p className="text-center text-sm text-muted">
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            {t("로그인으로 돌아가기", "Back to log in")}
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={submitReset} className="space-y-4">
      {notice && <div className="rounded bg-surface-muted p-3 text-sm text-content-soft">{notice}</div>}
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="reset-code" className="block text-sm font-medium text-content-soft">
            {t("이메일로 받은 6자리 코드", "6-digit code from your email")}
          </label>
          {remaining > 0 ? (
            <span className="text-xs text-primary">
              {t("유효 시간", "Time left")} {formatMmSs(remaining)}
            </span>
          ) : (
            <span className="text-xs text-red-600">{t("코드가 만료되었습니다", "The code has expired")}</span>
          )}
        </div>
        <input
          id="reset-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder={t("6자리 숫자", "6-digit code")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="reset-new-password" className="block text-sm font-medium text-content-soft">
          {t("새 비밀번호 (12자 이상)", "New password (12+ characters)")}
        </label>
        <div className="relative mt-1">
          <input
            id="reset-new-password"
            type={passwordVisible ? "text" : "password"}
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? t("비밀번호 숨기기", "Hide password") : t("비밀번호 보기", "Show password")}
            className="absolute inset-y-0 right-0 inline-flex min-w-11 items-center justify-center text-muted hover:text-foreground"
          >
            {passwordVisible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || code.length < 6 || newPassword.length < 12}
        className="min-h-12 w-full rounded-full bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? t("변경 중...", "Updating...") : t("비밀번호 변경", "Change password")}
      </button>

      <p className="text-center text-sm text-muted">
        <button
          type="button"
          onClick={requestCode}
          disabled={loading}
          className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
        >
          {t("코드 재발송", "Resend code")}
        </button>
        <span className="mx-2 text-faint">·</span>
        <button
          type="button"
          onClick={() => {
            setStep("request");
            setError("");
            setNotice("");
            setExpiresAt(null);
          }}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {t("이메일 다시 입력", "Change email")}
        </button>
      </p>
    </form>
  );
}
