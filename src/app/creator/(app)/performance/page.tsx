"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import api from "@/lib/api";
import KPICards from "@/components/metric/KPICards";
import MetricForm from "@/components/metric/MetricForm";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/workspace/PageHeader";
import {
  ResponsiveSheet,
  StatePanel,
  StateSkeleton,
  WorkspacePage,
  WorkspaceRecordCell,
  WorkspaceRecordList,
  WorkspaceRecordRow,
  WorkspaceStage,
} from "@/components/workspace/WorkspacePrimitives";
import viewStyles from "@/components/workspace/WorkspaceViews.module.css";

interface PerformanceItem {
  applicationId: number;
  campaignTitle: string;
  brandName: string;
  views: number;
  likes: number;
  comments: number;
  externalUrl: string | null;
  recordedAt: string | null;
}

interface Performance {
  totals: { views: number; likes: number; comments: number; completedCount: number };
  items: PerformanceItem[];
}

const COLUMNS = "minmax(14rem,1.4fr) minmax(7rem,.6fr) minmax(5rem,.45fr) minmax(5rem,.45fr) minmax(5rem,.45fr) minmax(7rem,.6fr)";

function requestPerformance(signal?: AbortSignal) {
  return api.get<Performance>("/me/performance", { signal });
}

export default function CreatorPerformancePage() {
  const { t } = useLang();
  const [data, setData] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<PerformanceItem | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const response = await requestPerformance();
      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    requestPerformance(controller.signal)
      .then((response) => { if (active) setData(response.data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, []);

  if (loading) return <WorkspacePage flow={false}><StateSkeleton label={t("성과 기록 불러오는 중", "Loading performance records")} /></WorkspacePage>;
  if (!data) return <WorkspacePage flow={false}><StatePanel tone="error" title={t("성과 데이터를 불러오지 못했습니다.", "Performance data is unavailable.")} description={t("잠시 후 다시 시도해주세요.", "Please try again shortly.")} action={<Button onClick={() => void reload()}>{t("다시 불러오기", "Retry")}</Button>} /></WorkspacePage>;

  const header = (
    <div className={viewStyles.headerStack}>
      <BackButton href="/creator/home" labelKo="캠페인 탐색으로" labelEn="Back to discover" />
      <PageHeader display="PERFORMANCE" subtitle={t("게시물의 실제 조회·반응 수치를 입력하고 작품별 기록을 비교하세요.", "Record real views and engagement, then compare performance by content.")} />
      <KPICards items={[
        { label: t("완료 캠페인", "Completed"), value: `${data.totals.completedCount}${t("건", "")}` },
        { label: t("누적 조회수", "Views"), value: data.totals.views.toLocaleString("ko-KR") },
        { label: t("누적 좋아요", "Likes"), value: data.totals.likes.toLocaleString("ko-KR") },
        { label: t("누적 댓글", "Comments"), value: data.totals.comments.toLocaleString("ko-KR") },
      ]} />
    </div>
  );

  return (
    <WorkspacePage size="wide" flow={false}>
      <WorkspaceStage className={viewStyles.pageStage} header={header}>
        {data.items.length === 0 ? (
          <StatePanel icon={BarChart3} title={t("정산 완료된 작업이 없어요.", "No settled work yet.")} description={t("완료한 캠페인의 실제 성과를 입력하면 작품별 기록이 표시됩니다.", "Enter real results from completed campaigns to see them here.")} />
        ) : (
          <WorkspaceRecordList columns={COLUMNS} labels={[t("작품", "Content"), t("입력", "Edit"), t("조회", "Views"), t("좋아요", "Likes"), t("댓글", "Comments"), t("기록일", "Recorded")]}>
            {data.items.map((item) => (
              <WorkspaceRecordRow key={item.applicationId} columns={COLUMNS}>
                <WorkspaceRecordCell label={t("작품", "Content")}><button type="button" className={`${viewStyles.titleCopy} text-left`} onClick={() => setEditTarget(item)}><strong className={viewStyles.recordTitle}>{item.campaignTitle}</strong><small className={viewStyles.recordMeta}>{item.brandName}</small></button></WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("입력", "Edit")}><Button variant="secondary" size="sm" onClick={() => setEditTarget(item)}>{t("성과 입력/수정", "Enter / edit")}</Button></WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("조회", "Views")}><span className={viewStyles.recordStrong}>{item.views.toLocaleString("ko-KR")}</span></WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("좋아요", "Likes")}>{item.likes.toLocaleString("ko-KR")}</WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("댓글", "Comments")}>{item.comments.toLocaleString("ko-KR")}</WorkspaceRecordCell>
                <WorkspaceRecordCell label={t("기록일", "Recorded")}>{item.recordedAt ? new Date(item.recordedAt).toLocaleDateString("ko-KR") : t("미입력", "Not recorded")}</WorkspaceRecordCell>
              </WorkspaceRecordRow>
            ))}
          </WorkspaceRecordList>
        )}
      </WorkspaceStage>

      <ResponsiveSheet open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title={t("성과 입력", "Enter performance")} description={editTarget?.campaignTitle} label={t("성과 입력 닫기", "Close performance form")} size="compact">
        {editTarget && <MetricForm applicationId={editTarget.applicationId} initial={{ views: editTarget.views, likes: editTarget.likes, comments: editTarget.comments, externalUrl: editTarget.externalUrl }} onSaved={() => { setEditTarget(null); void reload(); }} onCancel={() => setEditTarget(null)} />}
      </ResponsiveSheet>
    </WorkspacePage>
  );
}
