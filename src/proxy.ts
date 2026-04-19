import { NextRequest, NextResponse } from "next/server";

function extractRoleFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 루트 `/` — 비로그인은 랜딩 통과, 로그인은 역할별 홈으로 이동
  if (pathname === "/") {
    if (!token) return NextResponse.next();
    const role = extractRoleFromJwt(token);
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/members", request.url));
    }
    if (role === "CREATOR") {
      return NextResponse.redirect(new URL("/creator/home", request.url));
    }
    return NextResponse.next();
  }

  // 인증 필수 경로
  if (pathname === "/profile/setup" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const role = extractRoleFromJwt(token);
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/creator")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const role = extractRoleFromJwt(token);
    if (role !== "CREATOR") return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/creator/:path*",
    "/profile/setup",
  ],
};
