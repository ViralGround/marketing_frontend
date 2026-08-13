"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LEGAL_CONSENT_VERSIONS } from "@/lib/legalVersions";
import { useLang } from "@/lib/i18n";
import Button from "@/components/ui/Button";

interface MarketingConsentResponse {
  optedIn: boolean;
  optedInAt: string | null;
}

export default function MarketingConsentSettings() {
  const { t } = useLang();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [savedValue, setSavedValue] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    setStatus("loading");
    setMessage("");
    api
      .get<MarketingConsentResponse>("/account/marketing-consent")
      .then(({ data }) => {
        setSavedValue(data.optedIn);
        setOptedIn(data.optedIn);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api
      .get<MarketingConsentResponse>("/account/marketing-consent", {
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (active) {
          setSavedValue(data.optedIn);
          setOptedIn(data.optedIn);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = optedIn
        ? {
            optedIn: true,
            marketingVersion: LEGAL_CONSENT_VERSIONS.marketingVersion,
          }
        : { optedIn: false };
      const { data } = await api.put<MarketingConsentResponse>(
        "/account/marketing-consent",
        payload,
      );
      setSavedValue(data.optedIn);
      setOptedIn(data.optedIn);
      setMessage(
        data.optedIn
          ? t("마케팅 이메일 수신에 동의했습니다.", "Marketing email consent saved.")
          : t("마케팅 이메일 수신 동의를 철회했습니다.", "Marketing email consent withdrawn."),
      );
    } catch {
      setMessage(
        t(
          "변경하지 못했습니다. 최신 동의 내용을 확인한 뒤 다시 시도해주세요.",
          "We couldn't save the change. Review the latest consent text and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-10 border-y-2 border-ink bg-paper px-5 py-6 text-ink" aria-labelledby="marketing-consent-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet">PRIVACY CONTROL</p>
      <h2 id="marketing-consent-title" className="mt-2 text-xl font-bold">
        {t("마케팅 정보 수신", "Marketing communications")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        {t(
          "선택 동의이며 캠페인·이벤트 안내 이메일에만 사용합니다. 거부하거나 철회해도 서비스 이용에는 영향이 없습니다.",
          "This is optional and is used only for campaign and event emails. Refusing or withdrawing does not affect the service.",
        )}{" "}
        <Link href="/marketing" className="font-bold text-violet underline underline-offset-4">
          {t("동의 내용 보기", "Read the consent text")}
        </Link>
      </p>

      {status === "loading" && <p role="status" className="mt-5 text-sm font-semibold">{t("설정을 불러오는 중...", "Loading preference...")}</p>}
      {status === "error" && (
        <div role="alert" className="mt-5">
          <p className="text-sm font-semibold">{t("설정을 불러오지 못했습니다.", "We couldn't load your preference.")}</p>
          <Button type="button" size="sm" variant="secondary" onClick={load} className="mt-3 min-h-11">
            {t("다시 불러오기", "Try again")}
          </Button>
        </div>
      )}
      {status === "ready" && (
        <div className="mt-5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={optedIn}
              disabled={saving}
              onChange={(event) => {
                setOptedIn(event.target.checked);
                setMessage("");
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-violet"
            />
            <span className="text-sm font-bold leading-relaxed">
              {t("이메일 마케팅 정보 수신에 동의합니다. (선택)", "I agree to receive marketing emails. (Optional)")}
            </span>
          </label>
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={saving || optedIn === savedValue}
            className="mt-4 min-h-11"
          >
            {saving ? t("저장 중...", "Saving...") : t("수신 설정 저장", "Save preference")}
          </Button>
          {message && <p role="status" className="mt-3 text-sm font-semibold text-ink/75">{message}</p>}
        </div>
      )}
    </section>
  );
}
