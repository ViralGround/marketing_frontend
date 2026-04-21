import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }
    if (user.role !== "COMPANY") {
      return NextResponse.json({ message: "기업 계정만 접근 가능합니다" }, { status: 403 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { createdById: user.memberId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });

    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        id: c.id,
        title: c.title,
        brandName: c.brandName,
        rewardAmount: c.rewardAmount,
        totalBudget: c.totalBudget,
        maxParticipants: c.maxParticipants,
        status: c.status,
        escrowStatus: c.escrowStatus,
        deadline: c.deadline,
        depositRequestedAt: c.depositRequestedAt,
        fundedAt: c.fundedAt,
        createdAt: c.createdAt,
        applicationCount: c._count.applications,
      })),
    });
  } catch (err) {
    console.error("[company:campaigns:list]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }
    if (user.role !== "COMPANY") {
      return NextResponse.json({ message: "기업 계정만 접근 가능합니다" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      brandName,
      rewardAmount,
      maxParticipants,
      thumbnailUrl,
      requirements,
      deadline,
    } = body;

    if (!title || !description || !brandName) {
      return NextResponse.json({ message: "필수 정보를 입력해주세요" }, { status: 400 });
    }
    const reward = Number(rewardAmount);
    const max = Number(maxParticipants);
    if (!Number.isFinite(reward) || reward < 0) {
      return NextResponse.json({ message: "보상 금액을 올바르게 입력해주세요" }, { status: 400 });
    }
    if (!Number.isInteger(max) || max < 1) {
      return NextResponse.json({ message: "모집 인원을 올바르게 입력해주세요" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        brandName,
        rewardAmount: reward,
        maxParticipants: max,
        totalBudget: reward * max,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        requirements: requirements?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        status: "DRAFT",
        escrowStatus: "PENDING_DEPOSIT",
        createdById: user.memberId,
      },
    });

    return NextResponse.json(
      {
        id: campaign.id,
        title: campaign.title,
        totalBudget: campaign.totalBudget,
        escrowStatus: campaign.escrowStatus,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[company:campaigns:create]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
