"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { decodeJwtPayload, removeTokens, setTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { setGaUser, trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import AlertModal from "@/components/ui/AlertModal";
import type { TokenResponse, UserRole } from "@/types";

export default function LoginForm() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setWarning("");
    setLoading(true);

    try {
      const { data } = await api.post<TokenResponse>("/auth/login", {
        email,
        password,
      });

      const payload = decodeJwtPayload<{
        sub: string;
        email: string;
        name?: string;
        role: UserRole;
        exp?: number;
      }>(data.accessToken);
      const numericSub = payload ? Number(payload.sub) : NaN;
      const validRole =
        payload?.role === "ADMIN" ||
        payload?.role === "COMPANY" ||
        payload?.role === "CREATOR";
      const validExp = !!payload?.exp && payload.exp > Date.now() / 1000;
      if (
        !payload ||
        !payload.sub ||
        !Number.isFinite(numericSub) ||
        !payload.email ||
        !validRole ||
        !validExp
      ) {
        removeTokens();
        setError(
          t(
            "로그인 토큰이 유효하지 않습니다. 다시 시도해주세요.",
            "Your login token is invalid. Please try again.",
          ),
        );
        return;
      }
      setTokens(data.accessToken);
      const role = payload.role;
      setUser({
        id: numericSub,
        email: payload.email,
        name: payload.name ?? payload.email,
        role,
      });
      setGaUser(numericSub, role);
      trackEvent("login_success", { role });

      const homeByRole: Record<UserRole, string> = {
        ADMIN: "/admin/members",
        COMPANY: "/company/dashboard",
        CREATOR: "/creator/home",
      };
      const allowedPrefix: Record<UserRole, string> = {
        ADMIN: "/admin",
        COMPANY: "/company",
        CREATOR: "/creator",
      };
      const defaultHome = homeByRole[role];
      const redirectTo = searchParams.get("redirect");
      const prefix = allowedPrefix[role];
      const redirectAllowed =
        !!redirectTo &&
        redirectTo.startsWith("/") &&
        !redirectTo.startsWith("//") &&
        (redirectTo === prefix || redirectTo.startsWith(`${prefix}/`));
      const target = redirectAllowed ? redirectTo : defaultHome;
      router.push(target);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number; data?: { code?: string; message?: string } } }).response
          : undefined;
      const status = response?.status;
      const code = response?.data?.code;

      if (status === 403 && code === "EMAIL_NOT_VERIFIED") {
        setError(
          t(
            "이메일 인증이 완료되지 않은 계정입니다. 관리자에게 문의해주세요.",
            "This account's email is not verified yet. Please contact the administrator.",
          ),
        );
      } else if (status === 404 && code === "USER_NOT_FOUND") {
        setWarning(
          t(
            "존재하지 않는 계정입니다. 이메일을 확인해주세요.",
            "This account does not exist. Please check your email.",
          ),
        );
      } else if (status === 403 && code === "PENDING_APPROVAL") {
        setError(
          t(
            "아직 관리자 승인이 완료되지 않았습니다. 승인까지 영업일 기준 일주일 이상 걸릴 수 있으며, 승인되면 이메일로 알려드릴게요.",
            "Your account is still awaiting admin approval. This can take more than a week in business days, and we'll email you once it's approved.",
          ),
        );
      } else if (status === 403 && code === "REJECTED") {
        setError(
          t(
            "가입이 거절되었습니다. 자세한 문의는 관리자에게 연락해주세요.",
            "Your sign-up was rejected. Please contact the administrator for details.",
          ),
        );
      } else {
        setError(t("비밀번호가 올바르지 않습니다", "Your password is incorrect."));
      }
      trackEvent("login_fail", { status: status ?? null, reason: code ?? "unknown" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-content-soft">
          {t("이메일", "Email")}
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-line-strong px-3 py-2 text-foreground bg-surface placeholder-faint focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-content-soft">
          {t("비밀번호", "Password")}
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-line-strong px-3 py-2 text-foreground bg-surface placeholder-faint focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? t("로그인 중...", "Logging in...") : t("로그인", "Log in")}
      </button>

      <AlertModal
        open={!!warning}
        title={t("로그인 실패", "Login failed")}
        message={warning}
        onClose={() => setWarning("")}
      />
    </form>
  );
}
