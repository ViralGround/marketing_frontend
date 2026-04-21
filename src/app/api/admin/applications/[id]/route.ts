import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { notifyCreatorOfApplicationStatusChange } from "@/lib/email";
import { randomUUID } from "crypto";

const ALLOWED = ["APPROVED", "REJECTED", "SETTLED", "PENDING"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const { status, rewardPaidAmount } = body;

    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ message: "상태값이 올바르지 않습니다" }, { status: 400 });
    }

    const now = new Date();
    const data: Record<string, unknown> = { status };

    if (status === "APPROVED" || status === "REJECTED") {
      data.reviewedAt = now;
    }
    if (status === "SETTLED") {
      const paid = Number(rewardPaidAmount);
      if (!Number.isInteger(paid) || paid < 0) {
        return NextResponse.json({ message: "지급액이 올바르지 않습니다" }, { status: 400 });
      }
      data.rewardPaidAmount = paid;
      data.settledAt = now;
    }

    const application = await prisma.campaignApplication.update({
      where: { id: Number(id) },
      data,
      include: {
        campaign: { select: { id: true, title: true, escrowStatus: true, totalBudget: true } },
        creator: { select: { email: true, name: true } },
      },
    });

    if (status === "SETTLED") {
      const { escrowStatus } = application.campaign;
      if (escrowStatus === "FUNDED" || escrowStatus === "PARTIALLY_RELEASED") {
        const payout = Number(application.rewardPaidAmount ?? 0);
        const released = await prisma.escrowTransaction.aggregate({
          where: { campaignId: application.campaign.id, type: "RELEASE" },
          _sum: { amount: true },
        });
        const alreadyReleased = released._sum.amount ?? 0;
        const remaining = application.campaign.totalBudget - alreadyReleased;
        if (payout > remaining) {
          return NextResponse.json(
            { message: "예치금 잔액이 부족합니다" },
            { status: 400 }
          );
        }
        await prisma.$transaction([
          prisma.escrowTransaction.create({
            data: {
              campaignId: application.campaign.id,
              applicationId: application.id,
              type: "RELEASE",
              amount: payout,
              memo: `MOCK-REL-${randomUUID()}`,
            },
          }),
          prisma.campaign.update({
            where: { id: application.campaign.id },
            data: { escrowStatus: "PARTIALLY_RELEASED" },
          }),
        ]);
      }
    }

    if (status === "APPROVED" || status === "REJECTED" || status === "SETTLED") {
      const payload = {
        email: application.creator.email,
        name: application.creator.name,
        campaignTitle: application.campaign.title,
        status: status as "APPROVED" | "REJECTED" | "SETTLED",
        rewardAmount: application.rewardPaidAmount,
      };
      after(() =>
        notifyCreatorOfApplicationStatusChange(
          payload.email,
          payload.name,
          payload.campaignTitle,
          payload.status,
          payload.rewardAmount,
        ),
      );
    }

    return NextResponse.json({
      id: application.id,
      status: application.status,
      rewardPaidAmount: application.rewardPaidAmount,
      reviewedAt: application.reviewedAt,
      settledAt: application.settledAt,
    });
  } catch (err) {
    console.error("[admin:applications:update]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
