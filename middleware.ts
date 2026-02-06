import { NextRequest, NextResponse } from "next/server";

// Middleware now only handles the legacy sign-in redirect
// Main auth is handled client-side via LocalAuthGate
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect /sign-in to / (LocalAuthGate will show login if needed)
  if (pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|otf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
