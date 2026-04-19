import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }
    const { id } = await params;
    const { submissionUrl } = await request.json();

    const url = typeof submissionUrl === "string" ? submissionUrl.trim() : "";
    if (!url) {
      return NextResponse.json({ message: "제출 URL을 입력해주세요" }, { status: 400 });
    }
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ message: "올바른 URL이 아닙니다" }, { status: 400 });
    }

    const application = await prisma.campaignApplication.findUnique({
      where: { id: Number(id) },
      select: { id: true, status: true, creatorId: true },
    });
    if (!application) {
      return NextResponse.json({ message: "지원 내역을 찾을 수 없습니다" }, { status: 404 });
    }
    if (application.creatorId !== user.memberId) {
      return NextResponse.json({ message: "본인 지원만 제출할 수 있습니다" }, { status: 403 });
    }
    if (application.status !== "APPROVED" && application.status !== "SUBMITTED") {
      return NextResponse.json(
        { message: "승인된 지원만 제출할 수 있습니다" },
        { status: 400 },
      );
    }

    const updated = await prisma.campaignApplication.update({
      where: { id: application.id },
      data: {
        submissionUrl: url,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      select: { id: true, status: true, submissionUrl: true, submittedAt: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[me:applications:submit]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
