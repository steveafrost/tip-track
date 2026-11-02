import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/privacy",
  "/privacy-policy",
  "/api/mobile(.*)",
  "/api/web(.*)",
  "/app(.*)",
  "/search(.*)",
  "/submit(.*)",
  "/reports(.*)",
]);

const protectRoutes = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default process.env.CLERK_SECRET_KEY
  ? protectRoutes
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
