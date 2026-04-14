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
        { message: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, member.password);
    if (!valid) {
      return NextResponse.json(
        { message: "이메일 또는 비밀번호가 올바르지 않습니다" },
        { status: 401 }
      );
    }

    const accessToken = await signAccessToken(member.id, member.email, member.role);
    const refreshToken = await signRefreshToken(member.id);

    return NextResponse.json({ accessToken, refreshToken });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
