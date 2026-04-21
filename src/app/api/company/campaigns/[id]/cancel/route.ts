import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { randomUUID } from "crypto";

export async function POST(
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

    if (campaign.status === "CLOSED" || campaign.escrowStatus === "REFUNDED") {
      return NextResponse.json({ message: "이미 종료된 캠페인입니다" }, { status: 400 });
    }
    if (campaign._count.applications > 0) {
      return NextResponse.json(
        { message: "지원자가 있는 캠페인은 기업이 직접 취소할 수 없습니다. 관리자에게 문의하세요." },
        { status: 400 }
      );
    }

    const hasFunded = campaign.escrowStatus === "FUNDED";
    const ops = [];
    if (hasFunded) {
      ops.push(
        prisma.escrowTransaction.create({
          data: {
            campaignId,
            type: "REFUND",
            amount: campaign.totalBudget,
            memo: `MOCK-REF-${randomUUID()}`,
          },
        })
      );
    }
    ops.push(
      prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "CLOSED",
          escrowStatus: hasFunded ? "REFUNDED" : campaign.escrowStatus,
          refundedAt: hasFunded ? new Date() : null,
        },
      })
    );
    await prisma.$transaction(ops);

    return NextResponse.json({
      message: hasFunded
        ? "캠페인이 취소되고 예치금이 환불 처리되었습니다."
        : "캠페인이 취소되었습니다.",
    });
  } catch (err) {
    console.error("[company:campaigns:cancel]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
