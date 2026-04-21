import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "관리자만 접근 가능합니다" }, { status: 403 });
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
  if (campaign.escrowStatus !== "DEPOSIT_CONFIRMING") {
    return NextResponse.json(
      { message: "입금 확인 대기 상태의 캠페인만 반려할 수 있습니다" },
      { status: 400 }
    );
  }

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      escrowStatus: "PENDING_DEPOSIT",
      depositRequestedAt: null,
    },
  });

  return NextResponse.json({ message: "입금 확인이 반려되었습니다." });
}
