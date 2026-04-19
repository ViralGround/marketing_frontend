import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        creatorProfile: true,
        _count: { select: { contents: true } },
      },
    });

    if (!member) {
      return NextResponse.json(
        { message: "회원을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...member,
      contentCount: member._count.contents,
    });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const { id } = await params;
    const memberId = Number(id);

    // 관리자 본인 삭제 방지
    if (memberId === user.memberId) {
      return NextResponse.json(
        { message: "본인 계정은 삭제할 수 없습니다" },
        { status: 400 }
      );
    }

    // 관련 데이터 삭제 (콘텐츠, 프로필)
    await prisma.content.deleteMany({ where: { authorId: memberId } });
    await prisma.creatorProfile.deleteMany({ where: { memberId } });
    await prisma.member.delete({ where: { id: memberId } });

    return NextResponse.json({ message: "회원이 삭제되었습니다" });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
