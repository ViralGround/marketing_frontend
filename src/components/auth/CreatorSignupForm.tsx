"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { trackEvent } from "@/lib/gtag";
import { useLang } from "@/lib/i18n";
import AlertModal from "@/components/ui/AlertModal";
import EmailVerificationField from "@/components/auth/EmailVerificationField";
import SignupProgress from "@/components/auth/SignupProgress";
import AgreementSection, {
  EMPTY_AGREEMENT,
  type AgreementValue,
} from "@/components/auth/AgreementSection";
import { legalConsentPayload } from "@/lib/legalVersions";

type Gender = "MALE" | "FEMALE";
type EditingTool =
  | "CAPCUT"
  | "PREMIERE"
  | "FINAL_CUT"
  | "VN"
  | "OTHER"
  | "NONE";

const EDITING_TOOL_OPTIONS: { value: EditingTool; label: string; labelEn: string }[] = [
  { value: "CAPCUT", label: "캡컷(CapCut)", labelEn: "CapCut" },
  { value: "PREMIERE", label: "프리미어 프로", labelEn: "Premiere Pro" },
  { value: "FINAL_CUT", label: "파이널 컷", labelEn: "Final Cut" },
  { value: "VN", label: "VN", labelEn: "VN" },
  { value: "OTHER", label: "기타", labelEn: "Other" },
  { value: "NONE", label: "편집 경험 없음", labelEn: "No editing experience" },
];

const GENDER_OPTIONS: { value: Gender; label: string; labelEn: string }[] = [
  { value: "FEMALE", label: "여성", labelEn: "Female" },
  { value: "MALE", label: "남성", labelEn: "Male" },
];

const MIN_AGE = 14;
const MAX_AGE = 64;

export default function CreatorSignupForm() {
  const { t } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationModal, setValidationModal] = useState("");
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [agreement, setAgreement] = useState<AgreementValue>(EMPTY_AGREEMENT);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const formRef = useRef<HTMLFormElement>(null);
  const hasNavigatedRef = useRef(false);

  // 기본 정보
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);

  // 설문
  const [gender, setGender] = useState<Gender | "">("");
  const [birthYear, setBirthYear] = useState("");
  const [faceExposure, setFaceExposure] = useState<"" | "YES" | "NO">("");
  const [editingTool, setEditingTool] = useState<EditingTool | "">("");
  const [instagramId, setInstagramId] = useState("");
  const [tiktokId, setTiktokId] = useState("");
  const [youtubeId, setYoutubeId] = useState("");

  useEffect(() => {
    if (!hasNavigatedRef.current) return;
    formRef.current
      ?.querySelector<HTMLElement>(`[data-step-heading="${step}"]`)
      ?.focus();
  }, [step]);

  const goToStep = (nextStep: 1 | 2 | 3) => {
    hasNavigatedRef.current = true;
    setStep(nextStep);
  };

  const continueFromAccount = () => {
    if (!name.trim()) {
      setValidationModal(t("활동명을 입력해주세요", "Please enter your display name"));
      return;
    }
    if (!verifiedToken) {
      setValidationModal(
        t("이메일 인증을 완료해주세요", "Please complete email verification"),
      );
      return;
    }
    if (password.length < 12) {
      setValidationModal(
        t("비밀번호는 12자 이상 입력해주세요", "Enter a password with at least 12 characters"),
      );
      return;
    }
    goToStep(2);
  };

  const continueFromProfile = () => {
    if (!gender) {
      setValidationModal(t("성별을 선택해주세요", "Please select your gender"));
      return;
    }
    if (!birthYear) {
      setValidationModal(
        t("출생연도를 선택해주세요", "Please select your birth year"),
      );
      return;
    }
    if (!faceExposure) {
      setValidationModal(
        t("얼굴 공개 여부를 선택해주세요", "Please select whether you can show your face"),
      );
      return;
    }
    if (!editingTool) {
      setValidationModal(
        t("주로 사용하는 편집 툴을 선택해주세요", "Please select your main editing tool"),
      );
      return;
    }
    goToStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verifiedToken)
      return setValidationModal(
        t("이메일 인증을 완료해주세요", "Please complete email verification"),
      );
    if (!gender)
      return setValidationModal(t("성별을 선택해주세요", "Please select your gender"));
    if (!birthYear)
      return setValidationModal(
        t("출생연도를 선택해주세요", "Please select your birth year"),
      );
    if (!faceExposure)
      return setValidationModal(
        t("얼굴 공개 여부를 선택해주세요", "Please select whether you can show your face"),
      );
    if (!editingTool)
      return setValidationModal(
        t("주로 사용하는 편집 툴을 선택해주세요", "Please select the editing tool you mainly use"),
      );
    if (!agreement.age14 || !agreement.terms || !agreement.privacy || !agreement.thirdParty) {
      return setValidationModal(
        t("필수 약관에 모두 동의해주세요", "Please agree to all required terms"),
      );
    }

    setLoading(true);
    trackEvent("signup_submit", { role: "CREATOR" });
    try {
      await api.post("/auth/signup", {
        email,
        password,
        name,
        role: "CREATOR",
        verifiedToken,
        gender,
        age: new Date().getFullYear() - Number(birthYear),
        faceExposure: faceExposure === "YES",
        editingTool,
        instagramId: instagramId.trim() || null,
        tiktokId: tiktokId.trim() || null,
        youtubeId: youtubeId.trim() || null,
        agreedTerms: agreement.terms,
        agreedPrivacy: agreement.privacy,
        agreedAge14: agreement.age14,
        agreedThirdParty: agreement.thirdParty,
        marketingOptIn: agreement.marketing,
        ...legalConsentPayload("CREATOR", agreement.marketing),
      });
      trackEvent("signup_success", { role: "CREATOR" });
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
      const status = response?.status ?? 0;
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
        const msg = response?.data?.message ?? t("입력값을 확인해주세요", "Please check your input");
        setError(msg);
      } else {
        setError(
          t(
            "회원가입에 실패했습니다. 다시 시도해주세요.",
            "Sign-up failed. Please try again.",
          ),
        );
      }
      trackEvent("signup_fail", { role: "CREATOR", status });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <SignupProgress
        current={step}
        labels={[
          t("계정", "Account"),
          t("제작 경험", "Experience"),
          t("동의", "Consent"),
        ]}
      />
      {error && (
        <div role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* 기본 정보 */}
      <section className="space-y-4" hidden={step !== 1}>
        <h2 data-step-heading="1" tabIndex={-1} className="text-sm font-semibold text-muted outline-none">{t("기본 정보", "Basic information")}</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-content-soft">
            {t("활동명 (닉네임)", "Display name (nickname)")}
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder={t("채널에서 사용할 활동명", "Display name to use on your channel")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
          />
        </div>
        <EmailVerificationField
          email={email}
          onEmailChange={setEmail}
          onVerified={setVerifiedToken}
        />
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-content-soft">
            {t("비밀번호 (12자 이상)", "Password (12+ characters)")}
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              required
              minLength={12}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block min-h-12 w-full rounded-lg border border-line-strong px-3 py-2 pr-12 text-foreground placeholder-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? t("비밀번호 숨기기", "Hide password") : t("비밀번호 보기", "Show password")}
              className="absolute inset-y-0 right-0 inline-flex min-w-11 items-center justify-center text-muted hover:text-foreground"
            >
              {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={continueFromAccount}
          className="min-h-12 w-full border-2 border-ink bg-ink px-5 py-2.5 font-bold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          {t("제작 경험 입력하기", "Continue to experience")}
        </button>
      </section>

      {/* 설문 */}
      <section className="space-y-4" hidden={step !== 2}>
        <h2 data-step-heading="2" tabIndex={-1} className="text-sm font-semibold text-muted outline-none">{t("제작 경험", "Creation experience")}</h2>

        <div>
          <p className="mb-2 block text-sm font-medium text-content-soft">{t("성별", "Gender")}</p>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((g) => (
              <label
                key={g.value}
                className={`flex-1 cursor-pointer rounded border px-3 py-2 text-center text-sm ${
                  gender === g.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-line-strong text-content-soft hover:bg-surface-muted"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g.value}
                  checked={gender === g.value}
                  onChange={() => setGender(g.value)}
                  className="sr-only"
                />
                {t(g.label, g.labelEn)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="birthYear" className="block text-sm font-medium text-content-soft">
            {t("출생연도", "Birth year")}
          </label>
          <select
            id="birthYear"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground focus:border-gray-500 focus:outline-none"
          >
            <option value="">{t("몇년생인지 선택해주세요", "Please select your birth year")}</option>
            {Array.from(
              { length: MAX_AGE - MIN_AGE + 1 },
              (_, i) => new Date().getFullYear() - MIN_AGE - i,
            ).map((y) => (
              <option key={y} value={y}>
                {t(`${y}년생`, String(y))}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-faint">
            {t("만 14세 이상부터 가입할 수 있습니다.", "You must be 14 or older to sign up.")}
          </p>
        </div>

        <div>
          <p className="mb-2 block text-sm font-medium text-content-soft">
            {t("얼굴 공개 가능 여부", "Can you show your face?")}
          </p>
          <div className="flex gap-2">
            {[
              { value: "YES", label: "가능", labelEn: "Yes" },
              { value: "NO", label: "불가능", labelEn: "No" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 cursor-pointer rounded border px-3 py-2 text-center text-sm ${
                  faceExposure === opt.value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-line-strong text-content-soft hover:bg-surface-muted"
                }`}
              >
                <input
                  type="radio"
                  name="faceExposure"
                  value={opt.value}
                  checked={faceExposure === opt.value}
                  onChange={() => setFaceExposure(opt.value as "YES" | "NO")}
                  className="sr-only"
                />
                {t(opt.label, opt.labelEn)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="editingTool" className="block text-sm font-medium text-content-soft">
            {t("주로 사용하는 편집 툴", "Editing tool you mainly use")}
          </label>
          <select
            id="editingTool"
            required
            value={editingTool}
            onChange={(e) => setEditingTool(e.target.value as EditingTool)}
            className="mt-1 block w-full rounded border border-line-strong px-3 py-2 text-foreground focus:border-gray-500 focus:outline-none"
          >
            <option value="">{t("선택해주세요", "Please select")}</option>
            {EDITING_TOOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label, opt.labelEn)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <p className="block text-sm font-medium text-content-soft">
            {t("SNS 아이디", "Social media handles")}{" "}
            <span className="text-faint">
              {t("(선택, 경험 있으신 분만)", "(Optional, only if you have experience)")}
            </span>
          </p>
          <div>
            <label htmlFor="instagramId" className="sr-only">{t("인스타그램", "Instagram")}</label>
            <input
              id="instagramId"
              type="text"
              placeholder={t("인스타그램 아이디 (@ 없이)", "Instagram handle (without @)")}
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="tiktokId" className="sr-only">{t("틱톡", "TikTok")}</label>
            <input
              id="tiktokId"
              type="text"
              placeholder={t("틱톡 아이디 (@ 없이)", "TikTok handle (without @)")}
              value={tiktokId}
              onChange={(e) => setTiktokId(e.target.value)}
              className="block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="youtubeId" className="sr-only">{t("유튜브", "YouTube")}</label>
            <input
              id="youtubeId"
              type="text"
              placeholder={t("유튜브 채널명 또는 핸들 (@ 없이)", "YouTube channel name or handle (without @)")}
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              className="block w-full rounded border border-line-strong px-3 py-2 text-foreground placeholder-faint focus:border-gray-500 focus:outline-none"
            />
          </div>
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
            onClick={continueFromProfile}
            className="min-h-12 border-2 border-violet bg-violet px-4 py-2.5 font-bold text-white hover:bg-violet/90"
          >
            {t("동의 단계로", "Continue to consent")}
          </button>
        </div>
      </section>

      <section className="space-y-6" hidden={step !== 3}>
        <h2 data-step-heading="3" tabIndex={-1} className="sr-only outline-none">{t("약관 동의", "Consent")}</h2>
        <AgreementSection role="CREATOR" value={agreement} onChange={setAgreement} />

        <p className="border-y border-ink/25 bg-violet-soft/55 px-4 py-3 text-xs leading-relaxed text-ink/70">
          {t(
            "가입 신청 후 관리자가 검토하며, 승인까지 영업일 기준 일주일 이상 걸릴 수 있어요. 승인 결과는 이메일로 알려드리며, 승인 전에는 로그인할 수 없습니다.",
            "After you apply, an administrator reviews your application, which can take more than a week in business days. We'll email you the result, and you can't log in until you're approved.",
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
            {loading
              ? t("가입 신청 중...", "Submitting application...")
              : t("가입 신청", "Submit application")}
          </button>
        </div>
      </section>

      <AlertModal
        open={!!validationModal}
        title={t("필수 항목을 확인해주세요", "Please check the required fields")}
        message={validationModal}
        onClose={() => setValidationModal("")}
      />

      <AlertModal
        open={pendingModalOpen}
        title={t("가입 신청이 접수되었습니다", "Your application has been received")}
        message={t(
          "승인까지 영업일 기준 일주일 이상 걸릴 수 있어요.\n관리자 승인 후 이메일로 결과를 알려드리며, 승인 전에는 로그인할 수 없습니다.",
          "Approval can take more than a week in business days.\nWe'll email you the result after an administrator reviews it, and you can't log in until you're approved.",
        )}
        onClose={() => router.push("/login")}
      />
    </form>
  );
}
