import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (isLoginPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard/lottery-items", request.url));
  }

  if (!isLoginPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
