"use client";

import { useCallback, useEffect, useId, useState } from "react";
import api from "@/lib/api";
import { useLang } from "@/lib/i18n";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const ACTIONS = [
  "MEMBER_LOGIN",
  "MEMBER_LOGOUT",
  "MEMBER_PASSWORD_RESET",
  "MEMBER_SIGNUP",
  "MEMBER_WITHDRAWN",
  "MEMBER_STATUS_CHANGED",
  "MARKETING_CONSENT_CHANGED",
  "CAMPAIGN_APPLIED",
  "CAMPAIGN_STATE_CHANGED",
  "CONTENT_SUBMITTED",
  "REVIEW_CREATED",
  "FILE_PRESIGNED",
  "FILE_UPLOADED",
  "CONTACT_RECEIVED",
  "PROFILE_CHANGED",
  "METRICS_UPDATED",
  "METRICS_SYNC_TRIGGERED",
  "PAYMENT_STATE_CHANGED",
  "SOCIAL_ACCOUNT_CONNECTED",
  "SOCIAL_ACCOUNT_DISCONNECTED",
] as const;

interface AuditItem {
  id: number;
  requestId: string | null;
  actorId: number | null;
  actorRole: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: string;
  createdAt: string;
}

interface AuditPage {
  items: AuditItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface Filters {
  action: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = {
  action: "",
  actorId: "",
  resourceType: "",
  resourceId: "",
  from: "",
  to: "",
};

function toInstant(value: string) {
  return value ? new Date(value).toISOString() : "";
}

function buildQuery(filters: Filters, page: number) {
  const query = new URLSearchParams({ page: String(page), size: "50" });
  if (filters.action) query.set("action", filters.action);
  if (filters.actorId.trim()) query.set("actorId", filters.actorId.trim());
  if (filters.resourceType.trim()) query.set("resourceType", filters.resourceType.trim());
  if (filters.resourceId.trim()) query.set("resourceId", filters.resourceId.trim());
  if (filters.from) query.set("from", toInstant(filters.from));
  if (filters.to) query.set("to", toInstant(filters.to));
  return query.toString();
}

export default function AdminAuditLogsPage() {
  const { t, lang } = useLang();
  const actionId = useId();
  const actorId = useId();
  const resourceTypeId = useId();
  const resourceId = useId();
  const fromId = useId();
  const toId = useId();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<AuditPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadErrorMessage = t("감사로그를 불러오지 못했습니다.", "Failed to load audit logs.");

  const load = useCallback((signal?: AbortSignal) => {
    return api
      .get<AuditPage>(`/admin/audit-logs?${buildQuery(filters, page)}`, { signal })
      .then((response) => {
        setResult(response.data);
        setError("");
      })
      .catch((requestError) => {
        if (requestError?.code === "ERR_CANCELED") return;
        setError(loadErrorMessage);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, [filters, loadErrorMessage, page]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.from && draft.to && new Date(draft.from) >= new Date(draft.to)) {
      setError(t("시작 시간은 종료 시간보다 빨라야 합니다.", "Start time must be earlier than end time."));
      return;
    }
    setLoading(true);
    setPage(0);
    setFilters({ ...draft });
  };

  const clear = () => {
    setLoading(true);
    setDraft(EMPTY_FILTERS);
    setPage(0);
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{t("운영 보안", "Operations security")}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {t("감사로그", "Audit logs")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {t(
              "주요 계정·캠페인 변경을 시간순으로 확인합니다. 자유 형식 사유와 개인정보는 이 화면에 표시하지 않습니다.",
              "Review account and campaign changes chronologically. Free-form reasons and personal data are not exposed here.",
            )}
          </p>
        </div>
        <span className="text-sm text-muted">
          {t("조회 결과", "Results")} <b className="text-foreground">{result?.totalElements ?? 0}</b>
        </span>
      </header>

      <Card className="mb-5">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label htmlFor={actionId} className="grid gap-1.5 text-xs font-semibold text-content-soft">
            {t("액션", "Action")}
            <select
              id={actionId}
              value={draft.action}
              onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))}
              className="h-11 rounded-[10px] border border-line bg-surface px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-bg"
            >
              <option value="">{t("전체", "All")}</option>
              {ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
          </label>
          <label htmlFor={actorId} className="grid gap-1.5 text-xs font-semibold text-content-soft">
            {t("행위자 ID", "Actor ID")}
            <Input id={actorId} type="number" min={1} inputMode="numeric" value={draft.actorId} onChange={(event) => setDraft((current) => ({ ...current, actorId: event.target.value }))} />
          </label>
          <label htmlFor={resourceTypeId} className="grid gap-1.5 text-xs font-semibold text-content-soft">
            {t("리소스 유형", "Resource type")}
            <Input id={resourceTypeId} pattern="[A-Za-z0-9_.:-]+" maxLength={64} value={draft.resourceType} onChange={(event) => setDraft((current) => ({ ...current, resourceType: event.target.value }))} placeholder="campaign" />
          </label>
          <label htmlFor={resourceId} className="grid gap-1.5 text-xs font-semibold text-content-soft">
            {t("리소스 ID", "Resource ID")}
            <Input id={resourceId} pattern="[A-Za-z0-9_.:-]+" maxLength={96} value={draft.resourceId} onChange={(event) => setDraft((current) => ({ ...current, resourceId: event.target.value }))} />
          </label>
          <label htmlFor={fromId} className="grid gap-1.5 text-xs font-semibold text-content-soft">
            {t("시작 시간", "From")}
            <Input id={fromId} type="datetime-local" value={draft.from} onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))} />
          </label>
          <label htmlFor={toId} className="grid gap-1.5 text-xs font-semibold text-content-soft">
            {t("종료 시간", "To")}
            <Input id={toId} type="datetime-local" value={draft.to} onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))} />
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">
            <Button type="submit" size="sm">{t("필터 적용", "Apply filters")}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={clear}>{t("초기화", "Clear")}</Button>
          </div>
        </form>
      </Card>

      {error && <p role="alert" className="mb-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</p>}

      {loading && !result ? (
        <Card className="py-14 text-center text-muted">{t("불러오는 중...", "Loading...")}</Card>
      ) : result?.items.length === 0 ? (
        <Card className="border-dashed py-14 text-center text-muted">{t("조건에 맞는 감사로그가 없습니다.", "No audit logs match these filters.")}</Card>
      ) : (
        <Card className="overflow-hidden p-0" aria-busy={loading}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("시간", "Time")}</th>
                  <th className="px-4 py-3 font-medium">{t("액션", "Action")}</th>
                  <th className="px-4 py-3 font-medium">{t("행위자", "Actor")}</th>
                  <th className="px-4 py-3 font-medium">{t("리소스", "Resource")}</th>
                  <th className="px-4 py-3 font-medium">{t("결과", "Outcome")}</th>
                  <th className="px-4 py-3 font-medium">Request ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result?.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted">
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{item.action}</td>
                    <td className="px-4 py-3 text-content-soft">{item.actorId ? `${item.actorRole ?? "-"} #${item.actorId}` : t("시스템", "System")}</td>
                    <td className="px-4 py-3 text-content-soft"><span className="font-medium">{item.resourceType}</span>{item.resourceId ? ` #${item.resourceId}` : ""}</td>
                    <td className="px-4 py-3"><Badge tone={item.outcome === "SUCCESS" ? "success" : "warning"}>{item.outcome}</Badge></td>
                    <td className="max-w-48 truncate px-4 py-3 font-mono text-xs text-faint" title={item.requestId ?? undefined}>{item.requestId ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="text-xs text-muted">{t("페이지", "Page")} {(result?.page ?? 0) + 1} / {Math.max(result?.totalPages ?? 1, 1)}</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="secondary" disabled={!result || result.page <= 0 || loading} onClick={() => { setLoading(true); setPage((current) => Math.max(0, current - 1)); }}>{t("이전", "Previous")}</Button>
              <Button type="button" size="sm" variant="secondary" disabled={!result || result.page + 1 >= result.totalPages || loading} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>{t("다음", "Next")}</Button>
            </div>
          </footer>
        </Card>
      )}
    </div>
  );
}
