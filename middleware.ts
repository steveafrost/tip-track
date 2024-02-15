import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/search", "/submit", "/reports"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
