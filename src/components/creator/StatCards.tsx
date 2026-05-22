import Card from "@/components/ui/Card";

interface StatCardsProps {
  totalEarned: number;
  completedCount: number;
  activeCount: number;
}

export default function StatCards({
  totalEarned,
  completedCount,
  activeCount,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm font-medium text-muted">총 수익</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          ₩{totalEarned.toLocaleString("ko-KR")}
        </p>
        <p className="mt-1.5 text-xs text-faint">정산 완료된 캠페인 기준</p>
      </Card>
      <Card>
        <p className="text-sm font-medium text-muted">완료 캠페인</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {completedCount}건
        </p>
        <p className="mt-1.5 text-xs text-faint">정산까지 마친 캠페인</p>
      </Card>
      <Card>
        <p className="text-sm font-medium text-muted">진행 중</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {activeCount}건
        </p>
        <p className="mt-1.5 text-xs text-faint">대기·참여·제출 중</p>
      </Card>
    </div>
  );
}
