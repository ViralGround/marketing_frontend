import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

// 프로필 조회
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { memberId: user.memberId },
    });

    if (!profile) {
      return NextResponse.json({ hasProfile: false });
    }

    return NextResponse.json({
      hasProfile: true,
      profile: {
        canEdit: profile.canEdit,
        editingSkill: profile.editingSkill,
        faceExposure: profile.faceExposure,
        profileImage: profile.profileImage,
        instagramId: profile.instagramId,
      },
    });
  } catch {
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

// 프로필 생성 또는 수정
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }

    const { canEdit, editingSkill, faceExposure, profileImage, instagramId } =
      await request.json();

    // 유효성 검사
    if (typeof canEdit !== "boolean") {
      return NextResponse.json({ message: "편집 가능 여부는 필수입니다" }, { status: 400 });
    }
    if (!["HIGH", "MEDIUM", "LOW"].includes(editingSkill)) {
      return NextResponse.json({ message: "편집 실력은 HIGH, MEDIUM, LOW 중 선택해주세요" }, { status: 400 });
    }
    if (typeof faceExposure !== "boolean") {
      return NextResponse.json({ message: "얼굴 공개 여부는 필수입니다" }, { status: 400 });
    }

    const profile = await prisma.creatorProfile.upsert({
      where: { memberId: user.memberId },
      update: {
        canEdit,
        editingSkill,
        faceExposure,
        profileImage: profileImage || null,
        instagramId: instagramId || null,
      },
      create: {
        memberId: user.memberId,
        canEdit,
        editingSkill,
        faceExposure,
        profileImage: profileImage || null,
        instagramId: instagramId || null,
      },
    });

    return NextResponse.json({
      canEdit: profile.canEdit,
      editingSkill: profile.editingSkill,
      faceExposure: profile.faceExposure,
      profileImage: profile.profileImage,
      instagramId: profile.instagramId,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
