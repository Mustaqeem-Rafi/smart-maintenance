import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role;
    const path = req.nextUrl.pathname;
    
    // Helper to build URL
    const redirect = (url: string) => new NextResponse(null, {
        status: 307,
        headers: { Location: new URL(url, req.url).toString() }
    });

    // 1. PREVENT LOGGED-IN USERS FROM ACCESSING PUBLIC AUTH PAGES
    // If I am logged in, I shouldn't see the login page.
    if (path === "/login" || path === "/register" || path === "/") {
        if (role === "admin") return redirect("/admin");
        if (role === "technician") return redirect("/technician/dashboard");
        if (role === "student") return redirect("/student/dashboard");
        // If role is missing but token exists (rare), let them stay or go to student default
        return NextResponse.next();
    }

    // 2. ROLE-BASED ACCESS CONTROL (RBAC)
    
    // ADMIN ONLY
    if (path.startsWith("/admin")) {
        if (role !== "admin") return redirect("/login"); 
    }

    // TECHNICIAN ONLY
    if (path.startsWith("/technician")) {
        if (role !== "technician") return redirect("/login");
    }

    // STUDENT ONLY
    if (path.startsWith("/student")) {
        if (role !== "student") return redirect("/login");
    }

    // STAFF ONLY (If you still use this path)
    if (path.startsWith("/staff")) {
        if (role !== "technician" && role !== "admin") return redirect("/login");
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // This is the FIRST gate. 
      // If this returns false, the user is sent to /login automatically by NextAuth.
      // We return true to let the middleware function handle the specific redirects above.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // Overrides default /api/auth/signin
    }
  }
);

export const config = { 
  matcher: [
    "/login",
    "/register",
    "/admin/:path*", 
    "/student/:path*", 
    "/technician/:path*", 
    "/staff/:path*", // Added just in case
    "/report/:path*",
    "/profile/:path*" 
  ] 
};