import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "토큰이 없습니다", code: "MISSING_TOKEN" },
        { status: 400 }
      );
    }

    const record = await prisma.emailVerification.findUnique({
      where: { token },
      include: { member: true },
    });

    if (!record) {
      return NextResponse.json(
        { message: "유효하지 않은 인증 링크입니다", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await prisma.emailVerification.delete({ where: { token } });
      return NextResponse.json(
        { message: "인증 링크가 만료되었습니다. 다시 발송해주세요.", code: "EXPIRED_TOKEN" },
        { status: 400 }
      );
    }

    if (record.member.emailVerified) {
      await prisma.emailVerification.delete({ where: { token } });
      return NextResponse.json({ message: "이미 인증된 이메일입니다" });
    }

    await prisma.$transaction([
      prisma.member.update({
        where: { id: record.memberId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.delete({ where: { token } }),
    ]);

    return NextResponse.json({ message: "이메일 인증이 완료되었습니다" });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
