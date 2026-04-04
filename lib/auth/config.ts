export const LOGIN_PATH = "/login";

export const PROTECTED_PATH_PREFIXES = ["/dashboard", "/experiments"];

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function shouldRedirectAuthenticatedUser(pathname: string) {
  return pathname === LOGIN_PATH;
}
