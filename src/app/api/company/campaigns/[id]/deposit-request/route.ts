import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

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

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }
    if (campaign.createdById !== user.memberId) {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }
    if (campaign.escrowStatus !== "PENDING_DEPOSIT") {
      return NextResponse.json(
        { message: "현재 예치금 상태에서 허용되지 않는 작업입니다" },
        { status: 400 }
      );
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        escrowStatus: "DEPOSIT_CONFIRMING",
        depositRequestedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "입금 확인을 요청했습니다. 관리자 검토 후 모집이 시작됩니다.",
    });
  } catch (err) {
    console.error("[company:campaigns:deposit-request]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
