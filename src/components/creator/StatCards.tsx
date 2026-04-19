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
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">총 수익</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          ₩{totalEarned.toLocaleString("ko-KR")}
        </p>
        <p className="mt-1 text-xs text-gray-400">정산 완료된 캠페인 기준</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">완료 캠페인</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{completedCount}건</p>
        <p className="mt-1 text-xs text-gray-400">정산까지 마친 캠페인</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">진행 중</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{activeCount}건</p>
        <p className="mt-1 text-xs text-gray-400">대기·참여·제출 중</p>
      </div>
    </div>
  );
}
