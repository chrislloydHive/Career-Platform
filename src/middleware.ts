import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log('[Middleware]', {
    pathname: request.nextUrl.pathname,
  });

  // Temporarily bypass all auth checks
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|login|signup|_next/static|_next/image|favicon.ico).*)',
  ],
};