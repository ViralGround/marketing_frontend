import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Prisma.CampaignWhereInput = {};
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumCampaignStatusFilter<"Campaign">;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
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
        status: c.status,
        applicationCount: c._count.applications,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error("[admin:campaigns:list]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      brandName,
      rewardAmount,
      thumbnailUrl,
      requirements,
      deadline,
      maxParticipants,
    } = body;

    if (!title?.trim() || !description?.trim() || !brandName?.trim()) {
      return NextResponse.json({ message: "필수 항목을 입력해주세요" }, { status: 400 });
    }
    const reward = Number(rewardAmount);
    if (!Number.isInteger(reward) || reward < 0) {
      return NextResponse.json({ message: "보상 금액이 올바르지 않습니다" }, { status: 400 });
    }
    const maxP = Number(maxParticipants);
    if (!Number.isInteger(maxP) || maxP < 1) {
      return NextResponse.json({ message: "최대 참여자 수가 올바르지 않습니다" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        brandName: brandName.trim(),
        rewardAmount: reward,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        requirements: requirements?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        maxParticipants: maxP,
        createdById: user.memberId,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error("[admin:campaigns:create]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
