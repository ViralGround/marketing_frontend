import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: Number(id) },
      include: {
        applications: {
          orderBy: { appliedAt: "desc" },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                creatorProfile: {
                  select: {
                    gender: true,
                    age: true,
                    faceExposure: true,
                    editingTool: true,
                    instagramId: true,
                    tiktokId: true,
                    youtubeId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!campaign) {
      return NextResponse.json({ message: "캠페인을 찾을 수 없습니다" }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (err) {
    console.error("[admin:campaigns:detail]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PUT(
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
    const {
      title,
      description,
      brandName,
      rewardAmount,
      thumbnailUrl,
      requirements,
      deadline,
      maxParticipants,
      status,
    } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = String(title).trim();
    if (description !== undefined) data.description = String(description).trim();
    if (brandName !== undefined) data.brandName = String(brandName).trim();
    if (rewardAmount !== undefined) data.rewardAmount = Number(rewardAmount);
    if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl?.trim() || null;
    if (requirements !== undefined) data.requirements = requirements?.trim() || null;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (maxParticipants !== undefined) data.maxParticipants = Number(maxParticipants);
    if (status !== undefined) {
      if (!["OPEN", "CLOSED", "ARCHIVED"].includes(status)) {
        return NextResponse.json({ message: "상태값이 올바르지 않습니다" }, { status: 400 });
      }
      data.status = status;
    }

    const campaign = await prisma.campaign.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(campaign);
  } catch (err) {
    console.error("[admin:campaigns:update]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }
    const { id } = await params;
    const campaignId = Number(id);

    await prisma.campaignApplication.deleteMany({ where: { campaignId } });
    await prisma.campaign.delete({ where: { id: campaignId } });

    return NextResponse.json({ message: "캠페인이 삭제되었습니다" });
  } catch (err) {
    console.error("[admin:campaigns:delete]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
