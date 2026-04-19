import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
        applications:
          user.role === "CREATOR"
            ? { where: { creatorId: user.memberId }, select: { id: true, status: true } }
            : false,
      },
    });

    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        id: c.id,
        title: c.title,
        brandName: c.brandName,
        rewardAmount: c.rewardAmount,
        thumbnailUrl: c.thumbnailUrl,
        deadline: c.deadline,
        maxParticipants: c.maxParticipants,
        applicationCount: c._count.applications,
        myApplication:
          "applications" in c && Array.isArray(c.applications) && c.applications.length > 0
            ? c.applications[0]
            : null,
      })),
    });
  } catch (err) {
    console.error("[campaigns:list]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
