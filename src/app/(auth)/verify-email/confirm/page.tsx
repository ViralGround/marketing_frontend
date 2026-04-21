"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

type Status = "loading" | "success" | "expired" | "invalid" | "error";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        const code =
          typeof err === "object" && err !== null && "response" in err
            ? (err as { response?: { data?: { code?: string } } }).response?.data?.code
            : undefined;
        if (code === "EXPIRED_TOKEN") setStatus("expired");
        else if (code === "INVALID_TOKEN" || code === "MISSING_TOKEN") setStatus("invalid");
        else setStatus("error");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
        <p className="text-gray-500">인증 확인 중...</p>
      </div>
    );
  }

  const content = {
    success: {
      icon: "✅",
      title: "이메일 인증 완료!",
      desc: "이메일 인증이 완료되었습니다. 관리자 승인 후 로그인할 수 있어요. 승인 결과는 이메일로 알려드립니다.",
      link: "/login",
      linkText: "로그인 페이지로",
    },
    expired: {
      icon: "⏰",
      title: "인증 링크가 만료되었습니다",
      desc: "인증 링크의 유효 시간(24시간)이 지났습니다. 로그인 페이지에서 인증 메일을 다시 받아주세요.",
      link: "/login",
      linkText: "로그인 페이지로",
    },
    invalid: {
      icon: "❌",
      title: "유효하지 않은 링크입니다",
      desc: "인증 링크가 올바르지 않습니다. 메일에서 링크를 다시 확인해주세요.",
      link: "/login",
      linkText: "로그인 페이지로",
    },
    error: {
      icon: "⚠️",
      title: "오류가 발생했습니다",
      desc: "잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의해주세요.",
      link: "/login",
      linkText: "로그인 페이지로",
    },
  }[status];

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <div className="text-5xl">{content.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
        <p className="text-gray-600">{content.desc}</p>
        <Link
          href={content.link}
          className="inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          {content.linkText}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-65px)] items-center justify-center" />}>
      <ConfirmContent />
    </Suspense>
  );
}
