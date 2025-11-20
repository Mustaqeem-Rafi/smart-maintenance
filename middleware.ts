import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is trying to access /admin but is NOT an admin...
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.role !== "admin"
    ) {
      // ...redirect them back to the report page (or a 403 error)
      return NextResponse.rewrite(new URL("/report", req.url));
    }
  },
  {
    callbacks: {
      // This returns 'true' if the user has a token (is logged in)
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = { matcher: ["/admin/:path*", "/report/:path*"] };