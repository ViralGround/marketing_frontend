"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ImageUploader from "@/components/ui/ImageUploader";

interface ProfileData {
  companyName: string;
  industry: string | null;
  homepage: string | null;
  introduction: string | null;
  logoUrl: string | null;
}

const TEXTAREA_CLASS =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-faint transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [industry, setIndustry] = useState("");
  const [homepage, setHomepage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  // undefined = 변경 안 함, string = 새 로고, null = 로고 제거
  const [logoKey, setLogoKey] = useState<string | null | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/company/profile")
      .then((res) => {
        const d: ProfileData = res.data;
        setCompanyName(d.companyName ?? "");
        setIntroduction(d.introduction ?? "");
        setIndustry(d.industry ?? "");
        setHomepage(d.homepage ?? "");
        setLogoPreview(d.logoUrl);
      })
      .catch(() => setError("회사 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = (key: string | null) => {
    setLogoKey(key);
    if (key === null) setLogoPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const body: Record<string, string> = { introduction, industry, homepage };
    // 로고를 변경/제거한 경우에만 전송 (제거는 빈 문자열).
    if (logoKey !== undefined) body.logoFileKey = logoKey ?? "";
    api
      .patch("/company/profile", body)
      .then(() => setMessage("회사 정보가 저장되었습니다."))
      .catch(() => setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요."))
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="text-muted">불러오는 중...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">회사 정보</h1>
      <p className="mb-8 text-sm text-muted">
        여기서 입력한 소개와 로고는 랜딩 페이지의 회사 소개 모달과 대표 캠페인 카드에 노출됩니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-soft">회사명</label>
            <Input value={companyName} disabled />
            <p className="mt-1.5 text-xs text-faint">회사명은 가입 시 정보로 변경할 수 없습니다.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-content-soft">
              회사 로고 <span className="text-faint">(선택)</span>
            </label>
            <ImageUploader previewUrl={logoPreview} onChange={handleLogoChange} />
            <p className="mt-1.5 text-xs text-faint">정사각형 이미지를 권장합니다.</p>
          </div>

          <div>
            <label
              htmlFor="introduction"
              className="mb-1.5 block text-sm font-medium text-content-soft"
            >
              회사 소개 <span className="text-faint">(선택)</span>
            </label>
            <textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              rows={5}
              placeholder="회사와 브랜드를 소개해주세요. 크리에이터의 신뢰를 높이는 데 도움이 됩니다."
              className={TEXTAREA_CLASS}
            />
          </div>

          <div>
            <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-content-soft">
              산업 <span className="text-faint">(선택)</span>
            </label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="예: 뷰티, 식음료, 패션"
            />
          </div>

          <div>
            <label htmlFor="homepage" className="mb-1.5 block text-sm font-medium text-content-soft">
              홈페이지 <span className="text-faint">(선택)</span>
            </label>
            <Input
              id="homepage"
              type="url"
              value={homepage}
              onChange={(e) => setHomepage(e.target.value)}
              placeholder="https://"
            />
          </div>
        </Card>

        {message && <p className="text-sm font-medium text-success">{message}</p>}
        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <Button type="submit" disabled={saving} fullWidth>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </form>
    </div>
  );
}
