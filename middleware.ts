import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/api/auth");
  const authSession = request.cookies.get("auth_session");

  if (!isPublicRoute && !authSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isPublicRoute && authSession && pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
