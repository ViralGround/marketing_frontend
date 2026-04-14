import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id: Number(id) },
      include: { author: { select: { id: true, email: true, name: true, role: true } } },
    });

    if (!content) {
      return NextResponse.json(
        { message: "콘텐츠를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: content.id,
      title: content.title,
      body: content.body,
      status: content.status,
      author: content.author,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id: Number(id) },
    });

    if (!content) {
      return NextResponse.json(
        { message: "콘텐츠를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (content.authorId !== user.memberId) {
      return NextResponse.json(
        { message: "수정 권한이 없습니다" },
        { status: 403 }
      );
    }

    const { title, body, status } = await request.json();

    const updated = await prisma.content.update({
      where: { id: Number(id) },
      data: { title, body, status },
      include: { author: { select: { id: true, email: true, name: true, role: true } } },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      body: updated.body,
      status: updated.status,
      author: updated.author,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
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
    if (!user) {
      return NextResponse.json(
        { message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id: Number(id) },
    });

    if (!content) {
      return NextResponse.json(
        { message: "콘텐츠를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    if (content.authorId !== user.memberId) {
      return NextResponse.json(
        { message: "삭제 권한이 없습니다" },
        { status: 403 }
      );
    }

    await prisma.content.delete({ where: { id: Number(id) } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
