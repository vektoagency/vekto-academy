import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/course(.*)",
  "/community(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
    const role = (session.sessionClaims?.metadata as Record<string, string>)?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export function proxy(request: NextRequest, event: Parameters<typeof clerkHandler>[1]) {
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
