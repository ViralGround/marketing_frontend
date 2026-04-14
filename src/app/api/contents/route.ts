import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";

export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      include: { author: { select: { id: true, email: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      contents.map((c) => ({
        id: c.id,
        title: c.title,
        body: c.body,
        status: c.status,
        author: c.author,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    );
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { message: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const { title, body, status } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: "제목은 필수입니다" },
        { status: 400 }
      );
    }

    if (status && status !== "DRAFT" && status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "상태는 DRAFT 또는 PUBLISHED만 가능합니다" },
        { status: 400 }
      );
    }

    const content = await prisma.content.create({
      data: {
        title,
        body: body || null,
        status: status || "DRAFT",
        authorId: user.memberId,
      },
      include: { author: { select: { id: true, email: true, name: true, role: true } } },
    });

    return NextResponse.json(
      {
        id: content.id,
        title: content.title,
        body: content.body,
        status: content.status,
        author: content.author,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
