import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { notifyAdminsOfNewCreator } from "@/lib/email";
import type { Gender, EditingTool } from "@/generated/prisma/client";

const ALLOWED_GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];
const ALLOWED_TOOLS: EditingTool[] = [
  "CAPCUT",
  "PREMIERE",
  "FINAL_CUT",
  "VN",
  "OTHER",
  "NONE",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

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

    // 크리에이터 설문 필드 검증
    let survey: {
      gender: Gender;
      age: number;
      faceExposure: boolean;
      editingTool: EditingTool;
      instagramId: string | null;
      tiktokId: string | null;
      youtubeId: string | null;
    } | null = null;

    if (role === "CREATOR") {
      const { gender, age, faceExposure, editingTool, instagramId, tiktokId, youtubeId } = body;

      if (!gender || !ALLOWED_GENDERS.includes(gender)) {
        return NextResponse.json(
          { message: "성별을 선택해주세요" },
          { status: 400 }
        );
      }
      const ageNum = Number(age);
      if (!Number.isInteger(ageNum) || ageNum < 10 || ageNum > 100) {
        return NextResponse.json(
          { message: "나이를 올바르게 입력해주세요" },
          { status: 400 }
        );
      }
      if (typeof faceExposure !== "boolean") {
        return NextResponse.json(
          { message: "얼굴 공개 여부를 선택해주세요" },
          { status: 400 }
        );
      }
      if (!editingTool || !ALLOWED_TOOLS.includes(editingTool)) {
        return NextResponse.json(
          { message: "편집 툴을 선택해주세요" },
          { status: 400 }
        );
      }

      survey = {
        gender,
        age: ageNum,
        faceExposure,
        editingTool,
        instagramId: instagramId?.trim() || null,
        tiktokId: tiktokId?.trim() || null,
        youtubeId: youtubeId?.trim() || null,
      };
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
          role,
          status: role === "CREATOR" ? "PENDING" : "APPROVED",
        },
      });
      if (survey) {
        await tx.creatorProfile.create({
          data: {
            memberId: m.id,
            gender: survey.gender,
            age: survey.age,
            faceExposure: survey.faceExposure,
            editingTool: survey.editingTool,
            canEdit: survey.editingTool !== "NONE",
            instagramId: survey.instagramId,
            tiktokId: survey.tiktokId,
            youtubeId: survey.youtubeId,
          },
        });
      }
      return m;
    });

    if (role === "CREATOR" && survey) {
      // 응답 반환 후 백그라운드에서 관리자 알림 이메일 발송
      const notification = {
        memberId: member.id,
        name: member.name,
        email: member.email,
        gender: survey.gender,
        age: survey.age,
        editingTool: survey.editingTool,
        faceExposure: survey.faceExposure,
        instagramId: survey.instagramId,
        tiktokId: survey.tiktokId,
        youtubeId: survey.youtubeId,
      };
      after(() => notifyAdminsOfNewCreator(notification));
    }

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
    console.error("[signup] error:", err);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
