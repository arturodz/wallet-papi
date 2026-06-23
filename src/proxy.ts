import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

// Next.js 16 renamed the `middleware` file convention to `proxy`. The Neon Auth
// `auth.middleware()` helper (from createNeonAuth) returns a standard
// (request) => Promise<NextResponse> function that redirects unauthenticated
// page requests to `loginUrl`.
const authMiddleware = auth.middleware({ loginUrl: "/sign-in" });

export default function proxy(request: NextRequest) {
  // Server Actions POST to the page route with a `Next-Action` header. The auth
  // middleware redirects those to /sign-in (307 → HTML), which the React Server
  // Actions client can't parse ("An unexpected response was received from the
  // server"), breaking every create/edit/delete. Let Server Actions through —
  // each one enforces requireRole() server-side, so this is not a security gap.
  if (request.headers.get("next-action")) {
    return NextResponse.next();
  }
  return authMiddleware(request);
}

export const config = {
  // Run on all routes except Next internals, static files, the auth API
  // (handled by the route handler), the sign-in page, and the PWA assets
  // (manifest/service-worker/offline shell must be publicly fetchable for
  // install + offline to work).
  matcher: [
    "/((?!api/auth|sign-in|offline|manifest.webmanifest|sw.js|icons|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
