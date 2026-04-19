import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.campaignApplication.deleteMany({ where: { creatorId: user.memberId } }),
      prisma.creatorProfile.deleteMany({ where: { memberId: user.memberId } }),
      prisma.member.delete({ where: { id: user.memberId } }),
    ]);

    return NextResponse.json({ message: "탈퇴가 완료되었습니다" });
  } catch (err) {
    console.error("[me:delete]", err);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
