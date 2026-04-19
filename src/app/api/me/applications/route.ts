import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Prisma.CampaignApplicationWhereInput = { creatorId: user.memberId };
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumApplicationStatusFilter<"CampaignApplication">;
    }

    const applications = await prisma.campaignApplication.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            brandName: true,
            rewardAmount: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        submissionUrl: a.submissionUrl,
        rewardPaidAmount: a.rewardPaidAmount,
        appliedAt: a.appliedAt,
        settledAt: a.settledAt,
        campaign: a.campaign,
      })),
    });
  } catch (err) {
    console.error("[me:applications:list]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
