import { auth } from "@/lib/auth/server";

// Mounts all Neon Auth (Better Auth compatible) HTTP endpoints under
// /api/auth/*. The catch-all segment MUST be named `[...path]` because the
// SDK's handler reads `params.path` (typed `{ path: string[] }`).
export const { GET, POST } = auth.handler();
