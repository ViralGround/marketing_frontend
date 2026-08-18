"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspaceRecordCell,
  WorkspaceRecordList,
  WorkspaceRecordRow,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

interface Item { applicationId: number; creatorId: number; creatorName: string; views: number; likes: number; comments: number; externalUrl: string | null; recordedAt: string | null }
interface Performance { campaignId: number; campaignTitle: string; totals: { views: number; likes: number; comments: number; completedCount: number }; items: Item[] }
const COLUMNS = "minmax(12rem,1.3fr) minmax(7rem,.65fr) minmax(5rem,.45fr) minmax(5rem,.45fr) minmax(5rem,.45fr) minmax(7rem,.65fr)";

export default function CampaignPerformancePage() {
  const params = useParams<{ id: string }>();
  const { t } = useLang();
  const id = params?.id;
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let active = true;
    api.get<Performance>(`/company/campaigns/${id}/performance`, { signal: controller.signal }).then((response) => { if (active) { setData(response.data); setError(""); } }).catch(() => { if (active) setError(t("성과 정보를 불러오지 못했습니다", "Failed to load performance data")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [id, t]);

  if (loading) return <WorkspacePage flow={false}><StateSkeleton label={t("성과 리포트 불러오는 중", "Loading performance report")} /></WorkspacePage>;
  if (error || !data) return <WorkspacePage flow={false}><StatePanel tone="error" title={error || t("성과 데이터가 없습니다.", "No performance data.")} description={t("잠시 후 다시 시도하거나 캠페인 상태를 확인해주세요.", "Try again shortly or review the campaign status.")} /></WorkspacePage>;

  const header = <div className={viewStyles.headerStack}><Link href={`/company/campaigns/${data.campaignId}`} className="inline-flex h-11 items-center text-sm font-bold text-muted">&larr; {t("캠페인 상세로", "Back to campaign")}</Link><PageHeader display="PERFORMANCE" subtitle={data.campaignTitle} /><KPICards items={[{ label: t("완료 지원자", "Completed applicants"), value: `${data.totals.completedCount}${t("명", "")}` }, { label: t("총 조회수", "Views"), value: data.totals.views.toLocaleString("ko-KR") }, { label: t("총 좋아요", "Likes"), value: data.totals.likes.toLocaleString("ko-KR") }, { label: t("총 댓글", "Comments"), value: data.totals.comments.toLocaleString("ko-KR") }]} /></div>;

  return <WorkspacePage size="wide" flow={false}><WorkspaceStage className={viewStyles.pageStage} header={header}>{data.items.length === 0 ? <StatePanel icon={BarChart3} title={t("정산 완료된 지원자가 없습니다.", "No settled applicants yet.")} description={t("완료된 콘텐츠의 성과가 기록되면 여기에 표시됩니다.", "Recorded results from completed content appear here.")} /> : <WorkspaceRecordList columns={COLUMNS} labels={[t("크리에이터", "Creator"), t("게시물", "Post"), t("조회", "Views"), t("좋아요", "Likes"), t("댓글", "Comments"), t("기록일", "Recorded")]}>{data.items.map((item) => <WorkspaceRecordRow key={item.applicationId} columns={COLUMNS}><WorkspaceRecordCell label={t("크리에이터", "Creator")}><span className={viewStyles.recordTitle}>{item.creatorName}</span></WorkspaceRecordCell><WorkspaceRecordCell label={t("게시물", "Post")}>{item.externalUrl && isSafeHttpUrl(item.externalUrl) ? <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center text-xs font-bold text-primary underline">{t("게시물 보기", "View post")}</a> : "—"}</WorkspaceRecordCell><WorkspaceRecordCell label={t("조회", "Views")}><span className={viewStyles.recordStrong}>{item.views.toLocaleString("ko-KR")}</span></WorkspaceRecordCell><WorkspaceRecordCell label={t("좋아요", "Likes")}>{item.likes.toLocaleString("ko-KR")}</WorkspaceRecordCell><WorkspaceRecordCell label={t("댓글", "Comments")}>{item.comments.toLocaleString("ko-KR")}</WorkspaceRecordCell><WorkspaceRecordCell label={t("기록일", "Recorded")}>{item.recordedAt ? new Date(item.recordedAt).toLocaleDateString("ko-KR") : "—"}</WorkspaceRecordCell></WorkspaceRecordRow>)}</WorkspaceRecordList>}</WorkspaceStage></WorkspacePage>;
}

function isSafeHttpUrl(raw: string): boolean {
  try { const url = new URL(raw); return url.protocol === "http:" || url.protocol === "https:"; }
  catch { return false; }
}
