export { auth as middleware } from "@/lib/auth/config";

export const config = {
  matcher: [
    '/((?!api/auth|api/signup|login|signup|_next/static|_next/image|favicon.ico).*)',
  ],
};