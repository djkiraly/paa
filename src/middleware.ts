import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminPage =
    pathname === "/admin/login" ||
    pathname === "/admin/activate" ||
    pathname === "/admin/register" ||
    pathname === "/admin/verify-email";
  const isAuthenticated = !!req.auth;

  if (isAdminRoute && !isPublicAdminPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname === "/admin/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
