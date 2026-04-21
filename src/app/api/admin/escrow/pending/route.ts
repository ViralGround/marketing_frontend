import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "관리자만 접근 가능합니다" }, { status: 403 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { escrowStatus: "DEPOSIT_CONFIRMING" },
    orderBy: { depositRequestedAt: "asc" },
    include: {
      createdBy: {
        include: { companyProfile: { select: { companyName: true } } },
      },
    },
  });

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      brandName: c.brandName,
      companyName: c.createdBy.companyProfile?.companyName ?? "-",
      totalBudget: c.totalBudget,
      rewardAmount: c.rewardAmount,
      maxParticipants: c.maxParticipants,
      depositRequestedAt: c.depositRequestedAt,
      createdAt: c.createdAt,
    })),
  });
}
