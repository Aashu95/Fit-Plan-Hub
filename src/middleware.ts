import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const isLoggedIn = !!token;
      const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
      const isPublicRoute = ["/api/plans", "/api/auth/register"].some((route) =>
        req.nextUrl.pathname.startsWith(route)
      );

      if (isAuthRoute || isPublicRoute) {
        return true;
      }

      return isLoggedIn;
    },
  },
});

export const config = {
  matcher: ["/api/:path*"],
};
