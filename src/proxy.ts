/**
 * Next.js 16 Proxy (formerly middleware)
 * Renamed from middleware.ts → proxy.ts as required in Next.js v16.
 * The function must be named `proxy` (not `middleware`).
 *
 * Handles:
 * - Redirecting unauthenticated users away from protected routes
 * - Redirecting authenticated users away from auth pages
 * - Role-based route protection: /admin/* → ADMIN only
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session from cookie
  const sessionCookie = request.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);

  const isAuthenticated = !!session;
  const isAdmin = session?.role === "ADMIN";

  // ── Redirect authenticated users away from auth pages ──────────────────
  if (isAuthenticated && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/dashboard", request.url)
    );
  }

  // ── Protect /admin routes: must be ADMIN ───────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      // Regular users get redirected to their dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ── Protect /dashboard routes: must be authenticated ──────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimizations)
     * - favicon.ico, sitemap.xml, robots.txt (metadata)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)",
  ],
};
