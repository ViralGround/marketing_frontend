import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendEmailVerification } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      companyName,
      businessNumber,
      representativeName,
      contactName,
      contactPhone,
      address,
      homepage,
      industry,
    } = body;

    if (
      !email ||
      !password ||
      !name ||
      !companyName ||
      !businessNumber ||
      !representativeName ||
      !contactName ||
      !contactPhone
    ) {
      return NextResponse.json(
        { message: "필수 정보를 모두 입력해주세요" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "비밀번호는 8자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "이미 존재하는 이메일입니다" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const member = await prisma.$transaction(async (tx) => {
      const m = await tx.member.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "COMPANY",
          status: "APPROVED",
        },
      });
      await tx.companyProfile.create({
        data: {
          memberId: m.id,
          companyName: companyName.trim(),
          businessNumber: businessNumber.trim(),
          representativeName: representativeName.trim(),
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          address: address?.trim() || null,
          homepage: homepage?.trim() || null,
          industry: industry?.trim() || null,
        },
      });
      return m;
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerification.create({
      data: { memberId: member.id, token, expiresAt },
    });

    after(async () => {
      await sendEmailVerification(member.email, member.name, token);
    });

    return NextResponse.json(
      {
        id: member.id,
        email: member.email,
        name: member.name,
        role: member.role,
        status: member.status,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[signup/company] error:", err);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
