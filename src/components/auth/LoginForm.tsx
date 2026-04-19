"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { TokenResponse, UserRole } from "@/types";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("pending") === "1") {
      setInfo("가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있어요.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { data } = await api.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      setTokens(data.accessToken, data.refreshToken);

      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      const role = payload.role as UserRole;
      setUser({
        id: Number(payload.sub),
        email: payload.email,
        name: payload.name ?? payload.email,
        role,
      });

      if (role === "ADMIN") {
        router.push("/admin/members");
      } else {
        router.push("/creator/home");
      }
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number; data?: { code?: string; message?: string } } }).response
          : undefined;
      const status = response?.status;
      const code = response?.data?.code;

      if (status === 403 && code === "PENDING_APPROVAL") {
        setError("아직 관리자 승인이 완료되지 않았습니다. 승인되면 이메일로 알려드릴게요.");
      } else if (status === 403 && code === "REJECTED") {
        setError("가입이 거절되었습니다. 자세한 문의는 관리자에게 연락해주세요.");
      } else {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {info && !error && (
        <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">{info}</div>
      )}
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-foreground bg-white dark:bg-[#111] placeholder-gray-400 focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-foreground bg-white dark:bg-[#111] placeholder-gray-400 focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
