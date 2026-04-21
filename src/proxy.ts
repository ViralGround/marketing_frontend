import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

type Role = "CREATOR" | "COMPANY" | "ADMIN";

const HOME_BY_ROLE: Record<Role, string> = {
  CREATOR: "/creator/home",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/members",
};

const ROLE_PREFIXES: Record<Role, string[]> = {
  CREATOR: ["/creator"],
  COMPANY: ["/company"],
  ADMIN: ["/admin"],
};

const AUTH_PAGES = ["/login", "/signup"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  let role: Role | null = null;
  if (token) {
    const payload = await verifyToken(token);
    const r = payload?.role;
    if (r === "CREATOR" || r === "COMPANY" || r === "ADMIN") {
      role = r;
    }
  }

  const allProtected = Object.values(ROLE_PREFIXES).flat();
  const isProtected = allProtected.some((p) => matchesPrefix(pathname, p));
  const isAuthPage = AUTH_PAGES.some((p) => matchesPrefix(pathname, p));

  if (!role) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/" || isAuthPage) {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[role], request.url));
  }

  if (isProtected) {
    const allowed = ROLE_PREFIXES[role].some((p) => matchesPrefix(pathname, p));
    if (!allowed) {
      return NextResponse.redirect(new URL(HOME_BY_ROLE[role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/login/:path*",
    "/signup",
    "/signup/:path*",
    "/creator/:path*",
    "/company/:path*",
    "/admin/:path*",
  ],
};
