import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// NOTE: src/proxy.ts exists but exported `proxy` (not `middleware`) so it was
// never picked up by Next.js. This file is the correct middleware entry point.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
