import { NextRequest, NextResponse } from "next/server";
import { COOKIE } from "@/lib/session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(COOKIE)?.value);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (pathname.startsWith("/api")) {
    const isPublic = pathname.startsWith("/api/auth") || pathname.startsWith("/api/health");
    if (isPublic || hasSession) return NextResponse.next();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!isAuthPage && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
