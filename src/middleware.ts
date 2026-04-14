import { NextRequest, NextResponse } from "next/server";

function extractRoleFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Auth-protected paths (any authenticated user)
  const authProtectedPaths = ["/contents/new", "/profile/setup"];
  const isAuthProtected =
    authProtectedPaths.includes(pathname) ||
    /^\/contents\/\d+\/edit$/.test(pathname);

  if (isAuthProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Company-only paths
  if (pathname.startsWith("/company")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const role = extractRoleFromJwt(token);
    if (role !== "COMPANY") return NextResponse.redirect(new URL("/", request.url));
  }

  // Creator-only paths
  if (pathname.startsWith("/creator")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const role = extractRoleFromJwt(token);
    if (role !== "CREATOR") return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/contents/new", "/contents/:id/edit", "/company/:path*", "/creator/:path*", "/profile/setup"],
};
