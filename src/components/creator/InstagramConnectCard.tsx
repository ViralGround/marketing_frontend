"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Link2, Loader2, TriangleAlert, Unlink } from "lucide-react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

type ConnectionStatus = "PENDING" | "CONNECTED" | "ERROR" | "DISCONNECTED" | "NONE";

interface Connection {
  connected: boolean;
  status: ConnectionStatus;
  igUsername: string | null;
  profileInstagramId: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
}

interface AuthorizeResponse {
  authorizationUrl: string;
  expiresAt: string;
}

const FAILURE_REASONS: Record<string, { ko: string; en: string }> = {
  invalid_state: {
    ko: "연결 세션이 만료되었거나 일치하지 않습니다. 다시 연결해 주세요.",
    en: "The connection session expired or didn't match. Please try again.",
  },
  account_mismatch: {
    ko: "프로필에 등록한 인스타그램 계정과 로그인한 계정이 다릅니다.",
    en: "The Instagram account you signed in with doesn't match your profile.",
  },
  profile_required: {
    ko: "먼저 프로필에 인스타그램 아이디를 입력해 주세요.",
    en: "Add your Instagram handle to your profile first.",
  },
  provider_rejected: {
    ko: "Instagram에서 연결을 승인하지 않았습니다. 권한을 확인하고 다시 시도해 주세요.",
    en: "Instagram didn't approve the connection. Review the permissions and try again.",
  },
  temporary_failure: {
    ko: "Instagram 연결 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해 주세요.",
    en: "Instagram connection is temporarily unavailable. Please try again shortly.",
  },
};

export default function InstagramConnectCard() {
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [conn, setConn] = useState<Connection | null>(null);
  const [loadError, setLoadError] = useState("");
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const profileHandle = conn?.profileInstagramId?.trim() ?? "";
  const hasProfileHandle = profileHandle.length > 0;

  const fetchConnection = useCallback(() => {
    return api
      .get<Connection>("/creator/instagram/connection")
      .then((response) => {
        setConn(response.data);
        setLoadError("");
      })
      .catch(() =>
        setLoadError(t("연동 상태를 불러오지 못했습니다", "Failed to load connection status")),
      );
    // t is language-dependent but stable enough; language changes remount the surrounding page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  useEffect(() => {
    const result = searchParams.get("instagram");
    if (!result) return;

    const timer = window.setTimeout(() => {
      if (result === "connected") {
        setNotice(t("인스타그램 계정이 연결되었습니다.", "Your Instagram account is connected."));
        setActionError("");
        fetchConnection();
      } else if (result === "cancelled") {
        setNotice(t("Instagram 연결을 취소했습니다.", "Instagram connection was cancelled."));
      } else if (result === "error") {
        const reason = searchParams.get("reason") ?? "temporary_failure";
        const copy = FAILURE_REASONS[reason] ?? FAILURE_REASONS.temporary_failure;
        setActionError(t(copy.ko, copy.en));
        setNotice("");
      }

      const cleanParams = new URLSearchParams(searchParams.toString());
      cleanParams.delete("instagram");
      cleanParams.delete("reason");
      const query = cleanParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchConnection, pathname, router, searchParams, t]);

  const handleConnect = () => {
    if (!hasProfileHandle) {
      setActionError(
        t(
          "프로필관리에서 인스타그램 아이디를 먼저 입력해 주세요. 입력한 계정으로만 연결할 수 있습니다.",
          "Add your Instagram handle in profile settings first. You can only connect that account.",
        ),
      );
      return;
    }
    setWorking(true);
    setActionError("");
    setNotice("");
    api
      .post<AuthorizeResponse>("/creator/instagram/authorize")
      .then(({ data }) => {
        if (!data.authorizationUrl) throw new Error("Missing authorizationUrl");
        window.location.assign(data.authorizationUrl);
      })
      .catch(() => {
        setActionError(t("Instagram 연결을 시작하지 못했습니다. 다시 시도해 주세요.", "Couldn't start Instagram connection. Please try again."));
        setWorking(false);
      });
  };

  const handleDisconnect = () => {
    setWorking(true);
    setActionError("");
    setNotice("");
    api
      .delete("/creator/instagram/connection")
      .then(() => {
        setNotice(t("인스타그램 연결을 해제했습니다.", "Instagram was disconnected."));
        return fetchConnection();
      })
      .catch(() => setActionError(t("연동 해제에 실패했습니다", "Failed to disconnect")))
      .finally(() => setWorking(false));
  };

  const isConnected = conn?.status === "CONNECTED";
  const isError = conn?.status === "ERROR";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{t("인스타그램 연동", "Instagram connection")}</h2>
            <StatusBadge status={conn?.status ?? "NONE"} loading={!conn && !loadError} />
          </div>
          <p className="mt-1.5 text-sm text-muted">
            {t(
              "Meta의 공식 동의 화면을 통해 계정을 연결하면 릴스 성과를 동기화할 수 있습니다.",
              "Connect through Meta's official consent screen to sync reel performance.",
            )}
          </p>

          {conn && !isConnected && (hasProfileHandle ? (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-surface-chip px-2.5 py-1.5 text-xs text-content-soft">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              {t(`프로필에 등록된 @${profileHandle} 계정으로 로그인해 주세요.`, `Sign in with @${profileHandle}, the account registered in your profile.`)}
            </p>
          ) : (
            <p className="mt-2.5 inline-flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning/5 px-2.5 py-1.5 text-xs text-warning">
              <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                {t("연결하려면 프로필에 인스타그램 아이디가 필요합니다. ", "An Instagram handle is required. ")}
                <Link href="/profile/setup" className="font-medium underline underline-offset-2 hover:text-foreground">
                  {t("프로필관리에서 입력하기", "Add it in profile settings")}
                </Link>
              </span>
            </p>
          ))}

          {isConnected && (
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium text-foreground">{t("연결됨", "Connected")}{conn?.igUsername ? ` · @${conn.igUsername}` : ""}</p>
              {conn?.lastSyncedAt && <p className="text-xs text-muted">{t("마지막 동기화", "Last synced")}: {formatDateTime(conn.lastSyncedAt)}</p>}
            </div>
          )}

          {isError && (
            <p className="mt-3 inline-flex items-start gap-1.5 rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-xs text-error">
              <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>{t("이전 연결에서 오류가 발생했습니다. 다시 연결해 주세요.", "The previous connection failed. Please reconnect.")}</span>
            </p>
          )}
        </div>

        <div className="shrink-0">
          {isConnected ? (
            <button type="button" onClick={handleDisconnect} disabled={working} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60">
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
              {t("연결 해제", "Disconnect")}
            </button>
          ) : (
            <button type="button" onClick={handleConnect} disabled={working} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              {isError ? t("다시 연결", "Reconnect") : t("Instagram 연결", "Connect Instagram")}
            </button>
          )}
        </div>
      </div>

      {notice && <p role="status" className="mt-3 inline-flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" />{notice}</p>}
      {actionError && <p role="alert" className="mt-3 text-sm text-error">{actionError}</p>}
      {loadError && (
        <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-sm text-error">
          <span>{loadError}</span>
          <button type="button" onClick={() => fetchConnection()} className="min-h-11 rounded-full border border-error/30 px-4 font-semibold">
            {t("다시 시도", "Try again")}
          </button>
        </div>
      )}
    </Card>
  );
}

function StatusBadge({ status, loading }: { status: ConnectionStatus; loading: boolean }) {
  const { t } = useLang();
  if (loading) return <Badge tone="neutral">{t("확인 중", "Checking")}</Badge>;
  switch (status) {
    case "CONNECTED":
      return <Badge tone="success">{t("연결됨", "Connected")}</Badge>;
    case "PENDING":
      return <Badge tone="info">{t("연결 대기", "Pending")}</Badge>;
    case "ERROR":
      return <Badge tone="error">{t("오류", "Error")}</Badge>;
    default:
      return <Badge tone="neutral">{t("미연결", "Not connected")}</Badge>;
  }
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
