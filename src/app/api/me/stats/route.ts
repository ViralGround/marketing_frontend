import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const [settledAgg, settledCount, activeCount, recent] = await Promise.all([
      prisma.campaignApplication.aggregate({
        where: { creatorId: user.memberId, status: "SETTLED" },
        _sum: { rewardPaidAmount: true },
      }),
      prisma.campaignApplication.count({
        where: { creatorId: user.memberId, status: "SETTLED" },
      }),
      prisma.campaignApplication.count({
        where: {
          creatorId: user.memberId,
          status: { in: ["PENDING", "APPROVED", "SUBMITTED"] },
        },
      }),
      prisma.campaignApplication.findMany({
        where: { creatorId: user.memberId },
        orderBy: { appliedAt: "desc" },
        take: 3,
        include: {
          campaign: {
            select: { id: true, title: true, brandName: true, thumbnailUrl: true, rewardAmount: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalEarned: settledAgg._sum.rewardPaidAmount ?? 0,
      completedCount: settledCount,
      activeCount,
      recentApplications: recent.map((a) => ({
        id: a.id,
        status: a.status,
        appliedAt: a.appliedAt,
        rewardPaidAmount: a.rewardPaidAmount,
        campaign: a.campaign,
      })),
    });
  } catch (err) {
    console.error("[me:stats]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
