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
        message: a.message,
        submissionUrl: a.submissionUrl,
        rewardPaidAmount: a.rewardPaidAmount,
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

export async function PATCH(
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
      include: { _count: { select: { applications: true } } },
    });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }
    if (campaign.createdById !== user.memberId) {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    if (campaign.escrowStatus === "DEPOSIT_CONFIRMING") {
      return NextResponse.json(
        { message: "입금 확인 중에는 수정할 수 없습니다" },
        { status: 400 }
      );
    }
    if (campaign.escrowStatus === "REFUNDED" || campaign.status === "CLOSED") {
      return NextResponse.json(
        { message: "종료된 캠페인은 수정할 수 없습니다" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const canEditBudget =
      campaign.escrowStatus === "PENDING_DEPOSIT" ||
      (campaign.escrowStatus === "FUNDED" && campaign._count.applications === 0);

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.description === "string") data.description = body.description;
    if (typeof body.brandName === "string") data.brandName = body.brandName;
    if (typeof body.requirements === "string" || body.requirements === null) {
      data.requirements = body.requirements ? String(body.requirements).trim() : null;
    }
    if (typeof body.thumbnailUrl === "string" || body.thumbnailUrl === null) {
      data.thumbnailUrl = body.thumbnailUrl ? String(body.thumbnailUrl).trim() : null;
    }
    if (body.deadline !== undefined) {
      data.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    if (body.rewardAmount !== undefined || body.maxParticipants !== undefined) {
      if (!canEditBudget) {
        return NextResponse.json(
          { message: "지원자가 있거나 예치 완료된 캠페인은 보상/모집 인원을 수정할 수 없습니다" },
          { status: 400 }
        );
      }
      const reward = body.rewardAmount !== undefined ? Number(body.rewardAmount) : campaign.rewardAmount;
      const max = body.maxParticipants !== undefined ? Number(body.maxParticipants) : campaign.maxParticipants;
      if (!Number.isFinite(reward) || reward < 0) {
        return NextResponse.json({ message: "보상 금액이 올바르지 않습니다" }, { status: 400 });
      }
      if (!Number.isInteger(max) || max < 1) {
        return NextResponse.json({ message: "모집 인원이 올바르지 않습니다" }, { status: 400 });
      }
      data.rewardAmount = reward;
      data.maxParticipants = max;
      const newTotal = reward * max;
      if (campaign.escrowStatus === "FUNDED" && newTotal !== campaign.totalBudget) {
        return NextResponse.json(
          { message: "예치 완료 상태에서는 총 예산이 바뀌지 않아야 합니다. 캠페인을 취소 후 재등록해주세요." },
          { status: 400 }
        );
      }
      data.totalBudget = newTotal;
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data,
    });
    return NextResponse.json({ id: updated.id, message: "캠페인이 수정되었습니다." });
  } catch (err) {
    console.error("[company:campaigns:update]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function DELETE(
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
      include: { _count: { select: { applications: true } } },
    });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }
    if (campaign.createdById !== user.memberId) {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    if (campaign.escrowStatus !== "PENDING_DEPOSIT" || campaign._count.applications > 0) {
      return NextResponse.json(
        {
          message:
            "입금 대기 상태이고 지원자가 없는 캠페인만 삭제할 수 있습니다. 그 외에는 캠페인 취소를 이용하세요.",
        },
        { status: 400 }
      );
    }

    await prisma.campaign.delete({ where: { id: campaignId } });
    return NextResponse.json({ message: "캠페인이 삭제되었습니다." });
  } catch (err) {
    console.error("[company:campaigns:delete]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
