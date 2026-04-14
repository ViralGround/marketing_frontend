"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { UserRole } from "@/types";

export default function SignupForm({ role }: { role: UserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", { email, password, name, role });
      router.push("/login");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response?.status === "number" &&
        (err as { response: { status: number } }).response.status === 409
      ) {
        setError("이미 등록된 이메일입니다");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          활동명 (닉네임)
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="채널에서 사용할 활동명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          비밀번호 (8자 이상)
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="8자 이상 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-gray-900 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? "가입 중..." : "크리에이터로 가입하기"}
      </button>
    </form>
  );
}
