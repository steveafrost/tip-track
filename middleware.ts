import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const clerkMiddleware = authMiddleware({
  publicRoutes: [
    "/",
    "/api/mobile(.*)",
    "/api/web(.*)",
    "/search",
    "/submit",
    "/reports",
  ],
});

export default process.env.CLERK_SECRET_KEY
  ? clerkMiddleware
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
