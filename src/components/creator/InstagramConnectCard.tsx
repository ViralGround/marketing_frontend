"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Link2, Loader2, TriangleAlert, Unlink } from "lucide-react";
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

interface ConnectTokenResponse {
  token: string;
  userId: string;
  environment: string;
}

/** Phyllo Connect SDK 핸들. 사용하는 메서드/이벤트만 최소로 선언. */
interface PhylloConnectInstance {
  on(
    event: "accountConnected",
    cb: (accountId: string, workplatformId: string, userId: string) => void,
  ): void;
  on(
    event: "accountDisconnected",
    cb: (accountId: string, workplatformId: string, userId: string) => void,
  ): void;
  on(event: "tokenExpired", cb: (userId: string) => void): void;
  on(event: "exit", cb: (reason: string, userId: string) => void): void;
  on(
    event: "connectionFailure",
    cb: (reason: string, workplatformId: string, userId: string) => void,
  ): void;
  open(): void;
}

interface PhylloConnectStatic {
  initialize(config: {
    clientDisplayName: string;
    environment: string;
    userId: string;
    token: string;
  }): PhylloConnectInstance;
}

declare global {
  interface Window {
    PhylloConnect?: PhylloConnectStatic;
  }
}

const PHYLLO_SDK_SRC = "https://cdn.getphyllo.com/connect/v2/phyllo-connect.js";

/**
 * Phyllo Connect SDK 스크립트를 온디맨드로 주입하고 window.PhylloConnect 를 반환한다.
 * 이미 로드돼 있으면 재사용하고, 로딩 중이면 같은 로드 Promise 를 공유한다.
 */
let phylloSdkPromise: Promise<PhylloConnectStatic> | null = null;
function loadPhylloSdk(): Promise<PhylloConnectStatic> {
  if (typeof window !== "undefined" && window.PhylloConnect) {
    return Promise.resolve(window.PhylloConnect);
  }
  if (phylloSdkPromise) {
    return phylloSdkPromise;
  }
  phylloSdkPromise = new Promise<PhylloConnectStatic>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PHYLLO_SDK_SRC}"]`,
    );
    const onReady = () => {
      if (window.PhylloConnect) {
        resolve(window.PhylloConnect);
      } else {
        reject(new Error("PhylloConnect not available after load"));
      }
    };
    if (existing) {
      existing.addEventListener("load", onReady);
      existing.addEventListener("error", () => reject(new Error("Phyllo SDK load failed")));
      if (window.PhylloConnect) onReady();
      return;
    }
    const script = document.createElement("script");
    script.src = PHYLLO_SDK_SRC;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => {
      phylloSdkPromise = null; // 실패 시 다음 시도에서 재주입 허용
      reject(new Error("Phyllo SDK load failed"));
    };
    document.body.appendChild(script);
  });
  return phylloSdkPromise;
}

/**
 * 크리에이터 마이페이지의 인스타그램 연결 카드.
 *
 * - 마운트 시 GET /creator/instagram/connection 으로 상태 조회.
 *   set-state-in-effect 룰 회피를 위해 동기 setState 없이 비동기/이벤트 콜백에서만 갱신.
 * - 연결 버튼 → POST /creator/instagram/connect-token 으로 {token,userId,environment} 발급.
 *   - environment==="mock": mock-complete 로 즉시 연결 처리 후 재조회(키 발급 전·데모).
 *   - 그 외(sandbox/staging/production): Phyllo Connect SDK 를 온디맨드 주입해 동의 화면을 띄우고,
 *     accountConnected 콜백에서 connect-callback 으로 연결을 확정한다.
 */
export default function InstagramConnectCard() {
  const { t } = useLang();
  const [conn, setConn] = useState<Connection | null>(null);
  const [loadError, setLoadError] = useState("");
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState("");

  // 연동은 프로필에 등록된 인스타 아이디로만 가능 — 비어 있으면 게이트로 막는다.
  const profileHandle = conn?.profileInstagramId?.trim() ?? "";
  const hasProfileHandle = profileHandle.length > 0;

  const fetchConnection = useCallback(() => {
    return api
      .get<Connection>("/creator/instagram/connection")
      .then((res) => {
        setConn(res.data);
        setLoadError("");
      })
      .catch(() =>
        setLoadError(t("연동 상태를 불러오지 못했습니다", "Failed to load connection status")),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const failGeneric = () =>
    setActionError(t("연동에 실패했습니다. 다시 시도해 주세요", "Connection failed. Please try again"));

  const openPhylloConnect = (data: ConnectTokenResponse) => {
    loadPhylloSdk()
      .then((PhylloConnect) => {
        const connect = PhylloConnect.initialize({
          clientDisplayName: "Viral Ground",
          environment: data.environment,
          userId: data.userId,
          token: data.token,
        });

        connect.on("accountConnected", (accountId, workplatformId) => {
          api
            .post("/creator/instagram/connect-callback", { accountId, workplatformId })
            .then(() => fetchConnection())
            .catch(() => failGeneric())
            .finally(() => setWorking(false));
        });

        connect.on("tokenExpired", () => {
          setActionError(
            t(
              "연결 세션이 만료되었습니다. 다시 시도해 주세요.",
              "The connection session expired. Please try again.",
            ),
          );
          setWorking(false);
        });

        connect.on("connectionFailure", () => {
          setActionError(
            t(
              "인스타그램 연결에 실패했습니다. 다시 시도해 주세요.",
              "Failed to connect Instagram. Please try again.",
            ),
          );
          setWorking(false);
        });

        connect.on("exit", () => {
          // 사용자가 동의 화면을 닫음(연결 미완료). 에러는 표시하지 않고 작업 상태만 해제.
          setWorking(false);
        });

        connect.open();
      })
      .catch(() => {
        setActionError(
          t(
            "연동 모듈을 불러오지 못했습니다. 광고 차단·보안 확장 프로그램이 막았을 수 있어요 — 시크릿 창에서 시도하거나 차단을 해제해 주세요.",
            "Couldn't load the connection module. An ad/privacy blocker may be blocking it — try an incognito window or allow cdn.getphyllo.com.",
          ),
        );
        setWorking(false);
      });
  };

  const handleConnect = () => {
    if (!hasProfileHandle) {
      setActionError(
        t(
          "프로필관리에서 인스타그램 아이디를 먼저 입력해 주세요. 입력한 계정으로만 연동할 수 있어요.",
          "Please add your Instagram handle in profile settings first. You can only connect that account.",
        ),
      );
      return;
    }
    setWorking(true);
    setActionError("");
    api
      .post<ConnectTokenResponse>("/creator/instagram/connect-token")
      .then((res) => {
        const data = res.data;
        if (data.environment === "mock") {
          // mock 환경: 동의 화면이 없으므로 즉시 연결 완료 처리.
          return api
            .post("/creator/instagram/mock-complete", {})
            .then(() => fetchConnection())
            .finally(() => setWorking(false));
        }
        // 실연동: Connect SDK 를 열고, 이후 처리는 SDK 이벤트 콜백에서 working 을 해제한다.
        openPhylloConnect(data);
      })
      .catch(() => {
        failGeneric();
        setWorking(false);
      });
  };

  const handleDisconnect = () => {
    setWorking(true);
    setActionError("");
    api
      .delete("/creator/instagram/connection")
      .then(() => fetchConnection())
      .catch(() =>
        setActionError(t("연동 해제에 실패했습니다", "Failed to disconnect")),
      )
      .finally(() => setWorking(false));
  };

  const isConnected = conn?.status === "CONNECTED";
  const isError = conn?.status === "ERROR";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {t("인스타그램 연동", "Instagram connection")}
            </h2>
            <StatusBadge status={conn?.status ?? "NONE"} loading={!conn && !loadError} />
          </div>
          <p className="mt-1.5 text-sm text-muted">
            {t(
              "계정을 연동하면 릴스 성과(조회·좋아요·댓글·공유)가 자동으로 집계됩니다.",
              "Connect your account to automatically sync reel performance (views, likes, comments, shares).",
            )}
          </p>

          {conn &&
            !isConnected &&
            (hasProfileHandle ? (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-surface-chip px-2.5 py-1.5 text-xs text-content-soft">
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                {t(
                  `프로필에 등록된 @${profileHandle} 계정으로 로그인해 연결해 주세요.`,
                  `Sign in with @${profileHandle} (registered in your profile) to connect.`,
                )}
              </p>
            ) : (
              <p className="mt-2.5 inline-flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning/5 px-2.5 py-1.5 text-xs text-warning">
                <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
                <span>
                  {t(
                    "연동하려면 프로필에 인스타그램 아이디가 필요합니다. ",
                    "Connecting requires an Instagram handle in your profile. ",
                  )}
                  <Link
                    href="/profile/setup"
                    className="font-medium underline underline-offset-2 hover:text-foreground"
                  >
                    {t("프로필관리에서 입력하기", "Add it in profile settings")}
                  </Link>
                </span>
              </p>
            ))}

          {isConnected && (
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium text-foreground">
                {t("연결됨", "Connected")}
                {conn?.igUsername ? ` · @${conn.igUsername}` : ""}
              </p>
              {conn?.lastSyncedAt && (
                <p className="text-xs text-faint">
                  {t("마지막 동기화", "Last synced")}: {formatDateTime(conn.lastSyncedAt)}
                </p>
              )}
            </div>
          )}

          {isError && (
            <p className="mt-3 inline-flex items-start gap-1.5 rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-xs text-error">
              <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                {t("연동 중 오류가 발생했습니다. 다시 연결해 주세요.", "Something went wrong with the connection. Please reconnect.")}
                {conn?.lastError ? ` (${conn.lastError})` : ""}
              </span>
            </p>
          )}
        </div>

        <div className="shrink-0">
          {isConnected ? (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={working}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-content-soft transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4" />
              )}
              {t("연결 해제", "Disconnect")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={working}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {working ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {isError ? t("다시 연결", "Reconnect") : t("인스타그램 연결", "Connect Instagram")}
            </button>
          )}
        </div>
      </div>

      {actionError && <p className="mt-3 text-sm text-error">{actionError}</p>}
      {loadError && <p className="mt-3 text-sm text-error">{loadError}</p>}
    </Card>
  );
}

function StatusBadge({ status, loading }: { status: ConnectionStatus; loading: boolean }) {
  const { t } = useLang();
  if (loading) {
    return <Badge tone="neutral">{t("확인 중", "Checking")}</Badge>;
  }
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
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
