import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "이메일과 비밀번호는 필수입니다" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({ where: { email } });
    if (!member) {
      return NextResponse.json(
        { message: "존재하지 않는 계정입니다", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const valid = await verifyPassword(password, member.password);
    if (!valid) {
      return NextResponse.json(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    if (!member.emailVerified) {
      return NextResponse.json(
        {
          message: "이메일 인증이 필요합니다. 가입 시 발송된 인증 메일을 확인해주세요.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    if (member.status === "PENDING") {
      return NextResponse.json(
        {
          message: "관리자 승인 대기 중입니다. 승인 후 로그인할 수 있어요.",
          code: "PENDING_APPROVAL",
        },
        { status: 403 }
      );
    }

    if (member.status === "REJECTED") {
      return NextResponse.json(
        {
          message: "가입이 거절되었습니다. 문의는 관리자에게 연락해주세요.",
          code: "REJECTED",
        },
        { status: 403 }
      );
    }

    const accessToken = await signAccessToken(member.id, member.email, member.role, member.name);
    const refreshToken = await signRefreshToken(member.id);

    return NextResponse.json({ accessToken, refreshToken });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
