import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }
    if (user.role !== "COMPANY") {
      return NextResponse.json({ message: "기업 계정만 접근 가능합니다" }, { status: 403 });
    }

    const { id } = await params;
    const campaignId = Number(id);
    if (!Number.isInteger(campaignId)) {
      return NextResponse.json({ message: "잘못된 요청입니다" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: { select: { applications: true } },
        applications: {
          include: { creator: { select: { id: true, name: true, email: true } } },
          orderBy: { appliedAt: "desc" },
        },
        escrowTransactions: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }
    if (campaign.createdById !== user.memberId) {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    return NextResponse.json({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      brandName: campaign.brandName,
      rewardAmount: campaign.rewardAmount,
      totalBudget: campaign.totalBudget,
      maxParticipants: campaign.maxParticipants,
      status: campaign.status,
      escrowStatus: campaign.escrowStatus,
      deadline: campaign.deadline,
      requirements: campaign.requirements,
      thumbnailUrl: campaign.thumbnailUrl,
      depositRequestedAt: campaign.depositRequestedAt,
      fundedAt: campaign.fundedAt,
      createdAt: campaign.createdAt,
      applicationCount: campaign._count.applications,
      applications: campaign.applications.map((a) => ({
        id: a.id,
        status: a.status,
        appliedAt: a.appliedAt,
        submittedAt: a.submittedAt,
        settledAt: a.settledAt,
        creator: a.creator,
      })),
      escrowTransactions: campaign.escrowTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        memo: t.memo,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    console.error("[company:campaigns:detail]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
