"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CompanySignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
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
    setLoading(true);

    try {
      await api.post("/auth/signup/company", {
        email,
        password,
        name,
        companyName,
        businessNumber,
        representativeName,
        contactName,
        contactPhone,
        address: address.trim() || null,
        homepage: homepage.trim() || null,
        industry: industry.trim() || null,
      });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const response =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { status?: number; data?: { message?: string } } }).response
          : undefined;
      const status = response?.status;
      if (status === 409) {
        setError("이미 등록된 이메일입니다");
      } else if (status === 400) {
        setError(response?.data?.message ?? "입력값을 확인해주세요");
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500">계정 정보</h2>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="company@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            계정 사용자 이름
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="로그인 계정의 표시 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-gray-500">기업 정보</h2>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            회사명
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
          <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
            사업자등록번호
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
          <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700">
            대표자명
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
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            업종 <span className="text-gray-400">(선택)</span>
          </label>
          <input
            id="industry"
            type="text"
            placeholder="예: 뷰티, 패션, F&B"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            주소 <span className="text-gray-400">(선택)</span>
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
          <label htmlFor="homepage" className="block text-sm font-medium text-gray-700">
            홈페이지 <span className="text-gray-400">(선택)</span>
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

      <section className="space-y-4 border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold text-gray-500">담당자 정보</h2>
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
            담당자명
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
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
            담당자 연락처
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

      <p className="text-xs text-gray-500">
        가입 후 이메일 인증을 완료하시면 바로 로그인할 수 있습니다.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}
