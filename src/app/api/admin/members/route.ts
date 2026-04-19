import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/jwt";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.MemberWhereInput = {
      role: { not: "ADMIN" },
    };

    if (role && role !== "ALL") {
      where.role = role as Prisma.EnumRoleFilter<"Member">;
    }

    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumMemberStatusFilter<"Member">;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [
      total,
      companyCount,
      creatorCount,
      pendingCount,
      todayCount,
      weekCount,
      members,
    ] = await Promise.all([
      prisma.member.count({ where: { role: { not: "ADMIN" } } }),
      prisma.member.count({ where: { role: "COMPANY" } }),
      prisma.member.count({ where: { role: "CREATOR" } }),
      prisma.member.count({
        where: { role: { not: "ADMIN" }, status: "PENDING" },
      }),
      prisma.member.count({
        where: {
          role: { not: "ADMIN" },
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.member.count({
        where: {
          role: { not: "ADMIN" },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.member.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          creatorProfile: {
            select: { instagramId: true },
          },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    const [contentTotal, contentPublished, contentDraft] = await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where: { status: "PUBLISHED" } }),
      prisma.content.count({ where: { status: "DRAFT" } }),
    ]);

    return NextResponse.json({
      stats: {
        total,
        companyCount,
        creatorCount,
        pendingCount,
        todayCount,
        weekCount,
        contentTotal,
        contentPublished,
        contentDraft,
      },
      members: members.map((m) => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        status: m.status,
        createdAt: m.createdAt,
        instagramId: m.creatorProfile?.instagramId || null,
      })),
    });
  } catch (err) {
    console.error("[admin:list] error:", err);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
