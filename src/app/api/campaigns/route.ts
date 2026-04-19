import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import type { Prisma } from "@/generated/prisma/client";

type SortKey = "recent" | "reward" | "deadline";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get("sort") ?? "recent") as SortKey;
    const search = searchParams.get("search")?.trim();

    const where: Prisma.CampaignWhereInput = { status: "OPEN" };

    if (sort === "deadline") {
      where.deadline = { not: null };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brandName: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.CampaignOrderByWithRelationInput[] =
      sort === "reward"
        ? [{ rewardAmount: "desc" }, { createdAt: "desc" }]
        : sort === "deadline"
          ? [{ deadline: "asc" }, { createdAt: "desc" }]
          : [{ createdAt: "desc" }];

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy,
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
        createdAt: c.createdAt,
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
