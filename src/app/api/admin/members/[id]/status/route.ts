import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import { notifyCreatorOfStatusChange } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (status !== "APPROVED" && status !== "REJECTED" && status !== "PENDING") {
      return NextResponse.json(
        { message: "상태값이 올바르지 않습니다" },
        { status: 400 }
      );
    }

    const member = await prisma.member.update({
      where: { id: Number(id) },
      data: { status },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (status === "APPROVED" || status === "REJECTED") {
      const { email, name } = member;
      after(() => notifyCreatorOfStatusChange(email, name, status));
    }

    return NextResponse.json(member);
  } catch (err) {
    console.error("[admin:status] error:", err);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
