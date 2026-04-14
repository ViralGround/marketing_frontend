"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import type { TokenResponse, UserRole } from "@/types";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      setTokens(data.accessToken, data.refreshToken);

      // Decode JWT payload to get user info
      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      const role = payload.role as UserRole;
      setUser({
        id: Number(payload.sub),
        email: payload.email,
        name: payload.email,
        role,
      });

      // 역할별 리다이렉트
      if (role === "ADMIN") {
        router.push("/admin/members");
      } else if (role === "CREATOR") {
        const { data: profileData } = await api.get("/profile");
        if (profileData.hasProfile) {
          router.push("/creator/dashboard");
        } else {
          router.push("/profile/setup");
        }
      } else if (role === "COMPANY") {
        router.push("/company/dashboard");
      }
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
