"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLang } from "@/lib/i18n";
import { compactNumber, exactNumber } from "@/lib/format";

/**
 * 관리자 릴스 분석 대시보드 차트. recharts 기반.
 * - 색은 디자인 토큰 CSS 변수(var(--color-*))로 다크모드까지 자동 대응.
 * - 차트별로 독립 배치할 수 있게 named export. 카드 chrome/타이틀은 호출부(Panel)가 담당.
 * - 페이지에서 next/dynamic(ssr:false)로 불러와 클라이언트에서만 렌더(측정 기반 ResponsiveContainer).
 */

const CHART_HEIGHT = 260;
const AXIS = { fill: "var(--color-muted)", fontSize: 11 };
const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-line)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--color-foreground)",
};

/** 최근 14일 일별 조회수 추이(오래된→최신). */
export function ViewsTrendChart({ viewsTrend }: { viewsTrend: number[] }) {
  const { t, lang } = useLang();
  const lastIdx = viewsTrend.length - 1;
  const data = viewsTrend.map((views, i) => ({
    label: i === lastIdx ? t("오늘", "Today") : `${lastIdx - i}${t("일 전", "d")}`,
    views,
  }));

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="vgViewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS}
          axisLine={{ stroke: "var(--color-line)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={20}
        />
        <YAxis
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v: number) => compactNumber(v, lang)}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(v) => [exactNumber(Number(v), lang), t("조회수", "Views")]}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#vgViewsGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** 캠페인별 조회수(조회수 내림차순, 상위 8). */
export function CampaignViewsChart({ campaigns }: { campaigns: { title: string; views: number }[] }) {
  const { t, lang } = useLang();
  const data = campaigns.slice(0, 8).map((c) => ({
    name: c.title.length > 16 ? `${c.title.slice(0, 15)}…` : c.title,
    views: c.views,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted">
        {t("데이터 없음", "No data")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => compactNumber(v, lang)}
        />
        <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={110} />
        <Tooltip
          cursor={{ fill: "var(--color-surface-muted)" }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(v) => [exactNumber(Number(v), lang), t("조회수", "Views")]}
        />
        <Bar dataKey="views" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((_, i) => (
            <Cell key={i} fill="var(--color-primary)" fillOpacity={1 - i * 0.08} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
