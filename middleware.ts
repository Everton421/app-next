import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/novaConta", "/_next", "/images", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  const authUser = request.cookies.get("authUser");
  const authToken = request.cookies.get("authToken");

  if (!authUser && !authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};