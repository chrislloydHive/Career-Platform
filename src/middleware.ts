import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  console.log('[Middleware]', {
    pathname: req.nextUrl.pathname,
    hasAuth: !!req.auth,
    hasUser: !!req.auth?.user,
    userId: req.auth?.user?.id
  });

  // Allow all requests to pass through
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|login|signup|_next/static|_next/image|favicon.ico).*)',
  ],
};