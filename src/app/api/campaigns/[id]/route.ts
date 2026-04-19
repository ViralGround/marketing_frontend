import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }
    const { id } = await params;
    const campaignId = Number(id);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: { select: { applications: true } },
      },
    });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }

    let myApplication = null;
    if (user.role === "CREATOR") {
      myApplication = await prisma.campaignApplication.findUnique({
        where: {
          campaignId_creatorId: {
            campaignId,
            creatorId: user.memberId,
          },
        },
        select: { id: true, status: true, appliedAt: true, submissionUrl: true },
      });
    }

    return NextResponse.json({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      brandName: campaign.brandName,
      rewardAmount: campaign.rewardAmount,
      thumbnailUrl: campaign.thumbnailUrl,
      requirements: campaign.requirements,
      deadline: campaign.deadline,
      maxParticipants: campaign.maxParticipants,
      status: campaign.status,
      applicationCount: campaign._count.applications,
      myApplication,
    });
  } catch (err) {
    console.error("[campaigns:detail]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
