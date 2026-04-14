import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: "모든 필드는 필수입니다" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "비밀번호는 8자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    if (role === "ADMIN") {
      return NextResponse.json(
        { message: "허용되지 않는 역할입니다" },
        { status: 400 }
      );
    }

    if (role !== "COMPANY" && role !== "CREATOR") {
      return NextResponse.json(
        { message: "역할은 COMPANY 또는 CREATOR만 가능합니다" },
        { status: 400 }
      );
    }

    // Check duplicate email
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "이미 존재하는 이메일입니다" },
        { status: 409 }
      );
    }

    // Create member
    const hashedPassword = await hashPassword(password);
    const member = await prisma.member.create({
      data: { email, password: hashedPassword, name, role },
    });

    return NextResponse.json(
      { id: member.id, email: member.email, name: member.name, role: member.role },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
