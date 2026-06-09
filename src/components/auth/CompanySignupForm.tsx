"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import EmailVerificationField from "@/components/auth/EmailVerificationField";
import AgreementSection, {
  EMPTY_AGREEMENT,
  type AgreementValue,
} from "@/components/auth/AgreementSection";

export default function CompanySignupForm() {
  const { t } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreement, setAgreement] = useState<AgreementValue>(EMPTY_AGREEMENT);

  const [email, setEmail] = useState("");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [homepage, setHomepage] = useState("");
  const [industry, setIndustry] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!verifiedToken) {
      setError(t("이메일 인증을 완료해주세요", "Please complete email verification"));
      return;
    }
    if (!agreement.age14 || !agreement.terms || !agreement.privacy) {
      setError(t("필수 약관에 모두 동의해주세요", "Please agree to all required terms"));
      return;
    }
    setLoading(true);
    trackEvent("signup_submit", { role: "COMPANY" });

    try {
      await api.post("/auth/signup/company", {
        email,
        password,
        name,
        verifiedToken,
        companyName,
        businessNumber,
        representativeName,
        contactName,
        contactPhone,
        address: address.trim() || null,
        homepage: homepage.trim() || null,
        industry: industry.trim() || null,
        agreedTerms: agreement.terms,
        agreedPrivacy: agreement.privacy,
        agreedAge14: agreement.age14,
        marketingOptIn: agreement.marketing,
      });
      trackEvent("signup_success", { role: "COMPANY" });
      router.push(`/login/company`);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number; data?: { message?: string } } }).response
          : undefined;
      const status = response?.status;
      if (status === 409) {
        setError(t("이미 등록된 이메일입니다", "This email is already registered"));
      } else if (status === 400) {
        setError(
          response?.data?.message ??
            t("입력값을 확인해주세요", "Please check your input"),
        );
      } else {
        setError(
          t(
            "회원가입에 실패했습니다. 다시 시도해주세요.",
            "Sign-up failed. Please try again.",
          ),
        );
      }
      trackEvent("signup_fail", { role: "COMPANY", status: status ?? 0 });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted">{t("계정 정보", "Account information")}</h2>
        <EmailVerificationField
          email={email}
          onEmailChange={setEmail}
          onVerified={setVerifiedToken}
          placeholder="company@example.com"
        />
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-content-soft">
            {t("비밀번호 (8자 이상)", "Password (8+ characters)")}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-content-soft">
            {t("계정 사용자 이름", "Account username")}
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder={t("로그인 계정의 표시 이름", "Display name for your login account")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="text-sm font-semibold text-muted">{t("기업 정보", "Company information")}</h2>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-content-soft">
            {t("회사명", "Company name")}
          </label>
          <input
            id="companyName"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="businessNumber" className="block text-sm font-medium text-content-soft">
            {t("사업자등록번호", "Business registration number")}
          </label>
          <input
            id="businessNumber"
            type="text"
            required
            placeholder="000-00-00000"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="representativeName" className="block text-sm font-medium text-content-soft">
            {t("대표자명", "Representative name")}
          </label>
          <input
            id="representativeName"
            type="text"
            required
            value={representativeName}
            onChange={(e) => setRepresentativeName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-content-soft">
            {t("업종", "Industry")} <span className="text-faint">({t("선택", "Optional")})</span>
          </label>
          <input
            id="industry"
            type="text"
            placeholder={t("예: 뷰티, 패션, F&B", "e.g. Beauty, Fashion, F&B")}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-content-soft">
            {t("주소", "Address")} <span className="text-faint">({t("선택", "Optional")})</span>
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="homepage" className="block text-sm font-medium text-content-soft">
            {t("홈페이지", "Website")} <span className="text-faint">({t("선택", "Optional")})</span>
          </label>
          <input
            id="homepage"
            type="url"
            placeholder="https://"
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
            className={inputCls}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="text-sm font-semibold text-muted">{t("담당자 정보", "Contact information")}</h2>
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-content-soft">
            {t("담당자명", "Contact name")}
          </label>
          <input
            id="contactName"
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-content-soft">
            {t("담당자 연락처", "Contact phone number")}
          </label>
          <input
            id="contactPhone"
            type="tel"
            required
            placeholder="010-0000-0000"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className={inputCls}
          />
        </div>
      </section>

      <AgreementSection role="COMPANY" value={agreement} onChange={setAgreement} />

      <p className="text-xs text-muted">
        {t(
          "이메일 인증을 완료한 뒤 가입하기를 눌러주세요. 가입 후 바로 로그인할 수 있습니다.",
          "Please complete email verification before signing up. You can log in right after signing up.",
        )}
      </p>

      <button
        type="submit"
        disabled={loading || !verifiedToken}
        className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? t("가입 중...", "Signing up...") : t("가입하기", "Sign up")}
      </button>
    </form>
  );
}
