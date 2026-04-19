import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { notifyAdminsOfNewApplication } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ message: "크리에이터만 지원할 수 있습니다" }, { status: 403 });
    }
    const { id } = await params;
    const campaignId = Number(id);
    const body = await request.json().catch(() => ({}));
    const message: string | null = body?.message?.trim() || null;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, brandName: true, status: true },
    });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }
    if (campaign.status !== "OPEN") {
      return NextResponse.json({ message: "모집이 종료된 캠페인입니다" }, { status: 400 });
    }

    const existing = await prisma.campaignApplication.findUnique({
      where: { campaignId_creatorId: { campaignId, creatorId: user.memberId } },
    });
    if (existing) {
      return NextResponse.json({ message: "이미 지원한 캠페인입니다" }, { status: 409 });
    }

    const creator = await prisma.member.findUnique({
      where: { id: user.memberId },
      select: { email: true, name: true },
    });
    if (!creator) {
      return NextResponse.json({ message: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    const application = await prisma.campaignApplication.create({
      data: {
        campaignId,
        creatorId: user.memberId,
        message,
      },
    });

    const notif = {
      applicationId: application.id,
      campaignId,
      campaignTitle: campaign.title,
      brandName: campaign.brandName,
      creatorName: creator.name,
      creatorEmail: creator.email,
      message,
    };
    after(() => notifyAdminsOfNewApplication(notif));

    return NextResponse.json(
      { id: application.id, status: application.status },
      { status: 201 },
    );
  } catch (err) {
    console.error("[campaigns:apply]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
