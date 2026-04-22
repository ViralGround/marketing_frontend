import { NextRequest, NextResponse } from "next/server";

type Role = "CREATOR" | "COMPANY" | "ADMIN";

function decodeRole(token: string): Role | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function"
      ? atob(normalized)
      : Buffer.from(normalized, "base64").toString("utf-8");
    const payload = JSON.parse(json) as { role?: string; exp?: number };
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    const r = payload.role;
    if (r === "CREATOR" || r === "COMPANY" || r === "ADMIN") return r;
    return null;
  } catch {
    return null;
  }
}

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

  const role: Role | null = token ? decodeRole(token) : null;

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
