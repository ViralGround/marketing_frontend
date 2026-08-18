const PROTECTED_PREFIXES = ["/company", "/admin", "/profile"] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedAppPath(pathname: string): boolean {
  return (
    PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix)) ||
    pathname.startsWith("/creator/")
  );
}

export function isRoleWorkspacePath(pathname: string): boolean {
  return (
    matchesPrefix(pathname, "/company") ||
    matchesPrefix(pathname, "/admin") ||
    pathname.startsWith("/creator/")
  );
}
