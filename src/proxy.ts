import { NextRequest, NextResponse } from "next/server";

type Role = "CREATOR" | "COMPANY" | "ADMIN";

type TokenClaims = {
  role: Role | null;
  valid: boolean;
};

function parseToken(token: string): TokenClaims {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return { role: null, valid: false };
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + pad);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder("utf-8").decode(bytes);
    const payload = JSON.parse(json) as { role?: string; exp?: number };
    if (!payload.exp || Date.now() / 1000 > payload.exp) return { role: null, valid: false };
    const r = payload.role;
    const role = r === "CREATOR" || r === "COMPANY" || r === "ADMIN" ? r : null;
    return { role, valid: true };
  } catch {
    return { role: null, valid: false };
  }
}

const HOME_BY_ROLE: Record<Role, string> = {
  CREATOR: "/creator/home",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/members",
};

const PROTECTED_PREFIXES = ["/creator", "/company", "/admin"];
const AUTH_PAGES = ["/login", "/signup"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function withNoStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const claims: TokenClaims = token ? parseToken(token) : { role: null, valid: false };

  const isProtected = PROTECTED_PREFIXES.some((p) => matchesPrefix(pathname, p));
  const isAuthPage = AUTH_PAGES.some((p) => matchesPrefix(pathname, p));

  if (!claims.valid) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return withNoStore(NextResponse.redirect(url));
    }
    return NextResponse.next();
  }

  if (pathname === "/" || isAuthPage) {
    const home = claims.role ? HOME_BY_ROLE[claims.role] : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (isProtected) {
    return withNoStore(NextResponse.next());
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
