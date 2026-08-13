"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { setGaUser, trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import AlertModal from "@/components/ui/AlertModal";
import type { Member, UserRole } from "@/types";

type LoginRole = Extract<UserRole, "CREATOR" | "COMPANY">;

const DEMO_ALIAS_ENABLED = process.env.NODE_ENV !== "production";

export function resolveLoginCredentials(
  expectedRole: LoginRole,
  loginId: string,
  password: string,
  demoAliasEnabled = DEMO_ALIAS_ENABLED,
) {
  if (demoAliasEnabled && loginId.trim() === "1" && password === "1") {
    return {
      email:
        expectedRole === "CREATOR"
          ? "creator.demo@viralground.local"
          : "company.demo@viralground.local",
      password: "DemoLogin!2026",
    };
  }
  return { email: loginId.trim(), password };
}

export default function LoginForm({ expectedRole }: { expectedRole: LoginRole }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setWarning("");
    setLoading(true);

    try {
      const credentials = resolveLoginCredentials(expectedRole, email, password);
      await api.post("/auth/login", credentials);
      await api.get("/auth/csrf");
      const { data: member } = await api.get<Member>("/auth/me");
      const role = member.role;
      setUser(member);
      setGaUser(member.id, role);
      trackEvent("login_success", { role });

      const homeByRole: Record<UserRole, string> = {
        ADMIN: "/admin/members",
        COMPANY: "/company/dashboard",
        CREATOR: "/creator/dashboard",
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
        setError(t("이메일 또는 비밀번호를 확인해주세요", "Check your email and password."));
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
          {DEMO_ALIAS_ENABLED ? t("아이디 또는 이메일", "ID or email") : t("이메일", "Email")}
        </label>
        <input
          id="email"
          type={DEMO_ALIAS_ENABLED ? "text" : "email"}
          required
          autoComplete="username"
          placeholder={DEMO_ALIAS_ENABLED ? "1" : "example@email.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block min-h-12 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-foreground placeholder-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-content-soft">
          {t("비밀번호", "Password")}
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            type={passwordVisible ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block min-h-12 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 pr-12 text-foreground placeholder-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        disabled={loading}
        className="min-h-12 w-full rounded-full bg-primary py-2.5 text-white font-semibold transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? t("로그인 중...", "Logging in...") : t("로그인", "Log in")}
      </button>

      {DEMO_ALIAS_ENABLED && (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center text-xs font-medium text-primary">
          {t("테스트 로그인 · 아이디 1 / 비밀번호 1", "Test login · ID 1 / Password 1")}
        </p>
      )}

      <AlertModal
        open={!!warning}
        title={t("로그인 실패", "Login failed")}
        message={warning}
        onClose={() => setWarning("")}
      />
    </form>
  );
}
