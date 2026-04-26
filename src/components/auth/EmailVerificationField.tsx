"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

interface Props {
  email: string;
  onEmailChange: (email: string) => void;
  onVerified: (token: string | null) => void;
  label?: string;
  placeholder?: string;
}

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function EmailVerificationField({
  email,
  onEmailChange,
  onVerified,
  label = "이메일",
  placeholder = "example@email.com",
}: Props) {
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState<{ type: "info" | "error" | "success"; text: string } | null>(null);

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

  const handleEmailChange = (value: string) => {
    onEmailChange(value);
    if (verified || codeSent) {
      setCodeSent(false);
      setVerified(false);
      setCode("");
      setExpiresAt(null);
      setMessage(null);
      onVerified(null);
    }
  };

  const handleSendCode = async () => {
    const requestedEmail = email.trim();
    if (!requestedEmail) {
      setMessage({ type: "error", text: "이메일을 입력해주세요" });
      return;
    }
    setSendLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post<{ expiresAt: string; message: string }>(
        "/auth/email/request-code",
        { email: requestedEmail },
      );
      if (requestedEmail !== email.trim()) return;
      setCodeSent(true);
      setVerified(false);
      setCode("");
      setExpiresAt(new Date(data.expiresAt).getTime());
      setMessage({ type: "info", text: data.message ?? "인증 코드를 발송했습니다" });
      onVerified(null);
    } catch (err: unknown) {
      if (requestedEmail !== email.trim()) return;
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number; data?: { message?: string } } }).response
          : undefined;
      const status = response?.status;
      if (status === 409) {
        setMessage({ type: "error", text: "이미 가입된 이메일입니다" });
      } else {
        setMessage({
          type: "error",
          text: response?.data?.message ?? "코드 발송에 실패했습니다",
        });
      }
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const requestedEmail = email.trim();
    if (!code.trim()) {
      setMessage({ type: "error", text: "인증 코드를 입력해주세요" });
      return;
    }
    setVerifyLoading(true);
    setMessage(null);
    try {
      const { data } = await api.post<{ verifiedToken: string; message: string }>(
        "/auth/email/verify-code",
        { email: requestedEmail, code: code.trim() },
      );
      if (requestedEmail !== email.trim()) return;
      setVerified(true);
      setExpiresAt(null);
      setMessage({ type: "success", text: data.message ?? "이메일 인증이 완료되었습니다" });
      onVerified(data.verifiedToken);
    } catch (err: unknown) {
      if (requestedEmail !== email.trim()) return;
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number; data?: { message?: string } } }).response
          : undefined;
      setMessage({
        type: "error",
        text: response?.data?.message ?? "인증에 실패했습니다",
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const canResend = codeSent && !verified;

  return (
    <div className="space-y-2">
      <label htmlFor="email" className="block text-sm font-medium text-content-soft">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="email"
          type="email"
          required
          placeholder={placeholder}
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          disabled={verified}
          className="block min-w-0 flex-1 rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none disabled:bg-surface-chip disabled:text-muted"
        />
        <button
          type="button"
          onClick={handleSendCode}
          disabled={sendLoading || verified || !email.trim()}
          className="shrink-0 whitespace-nowrap rounded border border-gray-900 bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:border-line-strong disabled:text-faint"
        >
          {verified
            ? "인증 완료"
            : sendLoading
              ? "발송 중..."
              : canResend
                ? "재발송"
                : "인증하기"}
        </button>
      </div>

      {codeSent && !verified && (
        <div className="space-y-2 rounded border border-line bg-surface-muted p-3">
          <div className="flex items-center justify-between">
            <label htmlFor="verification-code" className="text-sm font-medium text-content-soft">
              인증 코드
            </label>
            {remaining > 0 ? (
              <span className="text-xs text-primary">유효 시간 {formatMmSs(remaining)}</span>
            ) : (
              <span className="text-xs text-red-600">코드가 만료되었습니다</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6자리 숫자"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="block min-w-0 flex-1 rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifyLoading || code.length < 6 || remaining <= 0}
              className="shrink-0 whitespace-nowrap rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifyLoading ? "확인 중..." : "인증 확인"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p
          className={`text-xs ${
            message.type === "error"
              ? "text-red-600"
              : message.type === "success"
                ? "text-green-600"
                : "text-muted"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
