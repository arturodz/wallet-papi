import { auth } from "@/lib/auth/server";

// Next.js 16 renamed the `middleware` file convention to `proxy`. The Neon
// Auth `auth.middleware()` helper (from createNeonAuth) returns a standard
// (request) => Promise<NextResponse> function, so it works unchanged as the
// default proxy export. It refreshes the session cookie when needed and
// redirects unauthenticated requests to `loginUrl`, sharing the same
// baseUrl/cookies config as the server instance and the route handler.
export default auth.middleware({ loginUrl: "/sign-in" });

export const config = {
  // Run on all routes except Next internals, static files, the auth API
  // (handled by the route handler), the sign-in page, and the PWA assets
  // (manifest/service-worker/offline shell must be publicly fetchable for
  // install + offline to work).
  matcher: [
    "/((?!api/auth|sign-in|offline|manifest.webmanifest|sw.js|icons|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
