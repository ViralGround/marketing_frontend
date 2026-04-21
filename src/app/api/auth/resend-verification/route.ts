import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailVerification } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "이메일은 필수입니다" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      // 이메일 존재 여부를 노출하지 않기 위해 200 반환
      return NextResponse.json({ message: "발송되었습니다" });
    }

    if (member.emailVerified) {
      return NextResponse.json(
        { message: "이미 인증된 이메일입니다", code: "ALREADY_VERIFIED" },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.emailVerification.upsert({
      where: { memberId: member.id },
      update: { token, expiresAt },
      create: { memberId: member.id, token, expiresAt },
    });

    after(() => sendEmailVerification(member.email, member.name, token));

    return NextResponse.json({ message: "인증 메일을 다시 발송했습니다" });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
