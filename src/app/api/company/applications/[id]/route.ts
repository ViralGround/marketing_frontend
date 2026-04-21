import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { notifyCreatorOfApplicationStatusChange } from "@/lib/email";
import { randomUUID } from "crypto";

type Action = "APPROVE" | "REJECT" | "SETTLE" | "REQUEST_REREVIEW";

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
    const applicationId = Number(id);
    if (!Number.isInteger(applicationId)) {
      return NextResponse.json({ message: "잘못된 요청입니다" }, { status: 400 });
    }

    const body = await request.json();
    const action = body.action as Action;
    if (!["APPROVE", "REJECT", "SETTLE", "REQUEST_REREVIEW"].includes(action)) {
      return NextResponse.json({ message: "action 값이 올바르지 않습니다" }, { status: 400 });
    }

    const application = await prisma.campaignApplication.findUnique({
      where: { id: applicationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            createdById: true,
            rewardAmount: true,
            totalBudget: true,
            escrowStatus: true,
          },
        },
        creator: { select: { email: true, name: true } },
      },
    });
    if (!application) {
      return NextResponse.json({ message: "지원 내역을 찾을 수 없습니다" }, { status: 404 });
    }
    if (application.campaign.createdById !== user.memberId) {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const now = new Date();
    const currentStatus = application.status;

    if (action === "APPROVE") {
      if (currentStatus !== "PENDING") {
        return NextResponse.json(
          { message: "지원 대기 상태에서만 승인할 수 있습니다" },
          { status: 400 }
        );
      }
      await prisma.campaignApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED", reviewedAt: now },
      });
      after(() =>
        notifyCreatorOfApplicationStatusChange(
          application.creator.email,
          application.creator.name,
          application.campaign.title,
          "APPROVED"
        )
      );
      return NextResponse.json({ message: "지원이 승인되었습니다." });
    }

    if (action === "REJECT") {
      if (currentStatus !== "PENDING") {
        return NextResponse.json(
          { message: "지원 대기 상태에서만 거절할 수 있습니다" },
          { status: 400 }
        );
      }
      await prisma.campaignApplication.update({
        where: { id: applicationId },
        data: { status: "REJECTED", reviewedAt: now },
      });
      after(() =>
        notifyCreatorOfApplicationStatusChange(
          application.creator.email,
          application.creator.name,
          application.campaign.title,
          "REJECTED"
        )
      );
      return NextResponse.json({ message: "지원이 거절되었습니다." });
    }

    if (action === "REQUEST_REREVIEW") {
      if (currentStatus !== "SUBMITTED") {
        return NextResponse.json(
          { message: "제출 완료 상태에서만 재제출을 요청할 수 있습니다" },
          { status: 400 }
        );
      }
      await prisma.campaignApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED", submittedAt: null, submissionUrl: null },
      });
      return NextResponse.json({ message: "재제출을 요청했습니다." });
    }

    // SETTLE
    if (currentStatus !== "SUBMITTED") {
      return NextResponse.json(
        { message: "제출 완료 상태에서만 정산할 수 있습니다" },
        { status: 400 }
      );
    }
    const payoutRaw = body.rewardPaidAmount ?? application.campaign.rewardAmount;
    const payout = Number(payoutRaw);
    if (!Number.isInteger(payout) || payout < 0) {
      return NextResponse.json({ message: "지급 금액이 올바르지 않습니다" }, { status: 400 });
    }

    const { escrowStatus, totalBudget, id: campaignId } = application.campaign;
    if (escrowStatus !== "FUNDED" && escrowStatus !== "PARTIALLY_RELEASED") {
      return NextResponse.json(
        { message: "예치금이 입금된 캠페인만 정산할 수 있습니다" },
        { status: 400 }
      );
    }
    const released = await prisma.escrowTransaction.aggregate({
      where: { campaignId, type: "RELEASE" },
      _sum: { amount: true },
    });
    const remaining = totalBudget - (released._sum.amount ?? 0);
    if (payout > remaining) {
      return NextResponse.json({ message: "예치금 잔액이 부족합니다" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.campaignApplication.update({
        where: { id: applicationId },
        data: {
          status: "SETTLED",
          rewardPaidAmount: payout,
          settledAt: now,
        },
      }),
      prisma.escrowTransaction.create({
        data: {
          campaignId,
          applicationId,
          type: "RELEASE",
          amount: payout,
          memo: `MOCK-REL-${randomUUID()}`,
        },
      }),
      prisma.campaign.update({
        where: { id: campaignId },
        data: { escrowStatus: "PARTIALLY_RELEASED" },
      }),
    ]);

    after(() =>
      notifyCreatorOfApplicationStatusChange(
        application.creator.email,
        application.creator.name,
        application.campaign.title,
        "SETTLED",
        payout
      )
    );

    return NextResponse.json({ message: "정산이 완료되었습니다.", rewardPaidAmount: payout });
  } catch (err) {
    console.error("[company:applications:review]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
