"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/resend-verification", { email });
      setSent(true);
    } catch {
      setError("발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-5xl">📧</div>
        <h1 className="text-2xl font-bold text-gray-900">이메일을 확인해주세요</h1>
        {email && (
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">{email}</span>로<br />
            인증 메일을 발송했습니다.
          </p>
        )}
        <p className="text-sm text-gray-500">
          메일함에서 인증 링크를 클릭하면 가입이 계속 진행됩니다.
          <br />
          링크는 <strong>24시간</strong> 동안 유효합니다.
        </p>

        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {sent ? (
          <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
            인증 메일을 다시 발송했습니다.
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading || !email}
            className="text-sm text-gray-500 underline disabled:opacity-40"
          >
            {loading ? "발송 중..." : "메일을 받지 못하셨나요? 다시 받기"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-65px)] items-center justify-center" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
