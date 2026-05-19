import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/mobile(.*)", "/search", "/submit", "/reports"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
