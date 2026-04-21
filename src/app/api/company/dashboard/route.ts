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
      select: { id: true, status: true, escrowStatus: true },
    });

    const summary = {
      totalCampaigns: campaigns.length,
      pendingDeposit: campaigns.filter((c) => c.escrowStatus === "PENDING_DEPOSIT").length,
      depositConfirming: campaigns.filter((c) => c.escrowStatus === "DEPOSIT_CONFIRMING").length,
      funded: campaigns.filter((c) => c.status === "OPEN").length,
      closed: campaigns.filter((c) => c.status === "CLOSED").length,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("[company:dashboard]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
