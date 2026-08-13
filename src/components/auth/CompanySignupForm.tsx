"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import EmailVerificationField from "@/components/auth/EmailVerificationField";
import SignupProgress from "@/components/auth/SignupProgress";
import AlertModal from "@/components/ui/AlertModal";
import AgreementSection, {
  EMPTY_AGREEMENT,
  type AgreementValue,
} from "@/components/auth/AgreementSection";
import { legalConsentPayload } from "@/lib/legalVersions";

export default function CompanySignupForm() {
  const { t } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreement, setAgreement] = useState<AgreementValue>(EMPTY_AGREEMENT);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const hasNavigatedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [homepage, setHomepage] = useState("");
  const [industry, setIndustry] = useState("");

  useEffect(() => {
    if (!hasNavigatedRef.current) return;
    formRef.current
      ?.querySelector<HTMLElement>(`[data-step-heading="${step}"]`)
      ?.focus();
  }, [step]);

  const goToStep = (nextStep: 1 | 2 | 3) => {
    setError("");
    hasNavigatedRef.current = true;
    setStep(nextStep);
  };

  const continueFromAccount = () => {
    if (!verifiedToken) {
      setError(t("이메일 인증을 완료해주세요", "Please complete email verification"));
      return;
    }
    if (password.length < 12) {
      setError(t("비밀번호는 12자 이상 입력해주세요", "Enter a password with at least 12 characters"));
      return;
    }
    if (!name.trim()) {
      setError(t("계정 사용자 이름을 입력해주세요", "Please enter an account username"));
      return;
    }
    goToStep(2);
  };

  const continueFromBusiness = () => {
    if (
      !companyName.trim() ||
      !businessNumber.trim() ||
      !representativeName.trim() ||
      !contactName.trim() ||
      !contactPhone.trim()
    ) {
      setError(t("필수 사업자·담당자 정보를 모두 입력해주세요", "Complete all required business and contact details"));
      return;
    }
    goToStep(3);
  };

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
        ...legalConsentPayload("COMPANY", agreement.marketing),
      });
      trackEvent("signup_success", { role: "COMPANY" });
      setPendingModalOpen(true);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as {
              response?: {
                status?: number;
                data?: { message?: string; code?: string };
              };
            }).response
          : undefined;
      const status = response?.status;
      if (response?.data?.code === "LEGAL_DOCUMENT_VERSION_MISMATCH") {
        goToStep(3);
        setError(
          t(
            "동의 문서가 변경되었습니다. 최신 내용을 확인한 뒤 다시 동의해주세요.",
            "The consent documents changed. Review the latest versions and agree again.",
          ),
        );
      } else if (status === 409) {
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
    "mt-1 block min-h-12 w-full rounded-lg border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <SignupProgress
        current={step}
        labels={[
          t("계정", "Account"),
          t("사업자", "Business"),
          t("동의", "Consent"),
        ]}
      />
      {error && (
        <div role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <section className="space-y-4" hidden={step !== 1}>
        <h2 data-step-heading="1" tabIndex={-1} className="text-sm font-semibold text-muted outline-none">{t("계정 정보", "Account information")}</h2>
        <EmailVerificationField
          email={email}
          onEmailChange={setEmail}
          onVerified={setVerifiedToken}
          placeholder="company@example.com"
        />
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-content-soft">
            {t("비밀번호 (12자 이상)", "Password (12+ characters)")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              required
              minLength={12}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? t("비밀번호 숨기기", "Hide password") : t("비밀번호 보기", "Show password")}
              className="absolute inset-y-0 right-0 mt-1 inline-flex min-w-11 items-center justify-center text-muted hover:text-foreground"
            >
              {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
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
        <button
          type="button"
          onClick={continueFromAccount}
          className="min-h-12 w-full border-2 border-ink bg-ink px-5 py-2.5 font-bold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          {t("사업자 정보 입력하기", "Continue to business details")}
        </button>
      </section>

      <section className="space-y-4" hidden={step !== 2}>
        <h2 data-step-heading="2" tabIndex={-1} className="text-sm font-semibold text-muted outline-none">{t("브랜드 정보", "Brand information")}</h2>
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

      <section className="space-y-4 border-t border-line pt-6" hidden={step !== 2}>
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
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="min-h-12 border-2 border-ink bg-white px-4 py-2.5 font-bold text-ink hover:bg-paper"
          >
            {t("이전", "Back")}
          </button>
          <button
            type="button"
            onClick={continueFromBusiness}
            className="min-h-12 border-2 border-violet bg-violet px-4 py-2.5 font-bold text-white hover:bg-violet/90"
          >
            {t("동의 단계로", "Continue to consent")}
          </button>
        </div>
      </section>

      <section className="space-y-6" hidden={step !== 3}>
        <h2 data-step-heading="3" tabIndex={-1} className="sr-only outline-none">{t("약관 동의", "Consent")}</h2>
        <AgreementSection role="COMPANY" value={agreement} onChange={setAgreement} />

        <p className="border-y border-ink/25 bg-violet-soft/55 px-4 py-3 text-xs leading-relaxed text-ink/70">
          {t(
            "신청을 제출하면 계정은 검토 대기 상태가 됩니다. 운영팀이 사업자 정보와 참여 적합도를 확인한 뒤 승인 결과를 이메일로 안내합니다.",
            "After submission, your account remains pending while our team reviews the business details and beta fit. We send the decision by email.",
          )}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="min-h-12 border-2 border-ink bg-white px-4 py-2.5 font-bold text-ink hover:bg-paper"
          >
            {t("이전", "Back")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 border-2 border-violet bg-violet px-4 py-2.5 font-bold text-white transition-colors hover:bg-violet/90 disabled:opacity-50"
          >
            {loading ? t("신청 중...", "Applying...") : t("브랜드 베타 신청", "Apply to brand beta")}
          </button>
        </div>
      </section>

      <AlertModal
        open={pendingModalOpen}
        title={t("베타 신청이 접수되었습니다", "Your beta application was received")}
        message={t(
          "계정은 검토 대기 상태입니다. 운영팀 확인 후 승인 결과를 이메일로 안내하며, 승인 전에는 로그인할 수 없습니다.",
          "Your account is pending review. We'll email you after the team completes its review; you can't sign in before approval.",
        )}
        onClose={() => router.push("/login/company")}
      />
    </form>
  );
}
