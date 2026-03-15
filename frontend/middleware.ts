import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value; // add ?.value

  const protectedRoutes = ["/dashboard", "/admin"];

  if (
    protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 👇 ADD THIS BLOCK
    if (request.nextUrl.pathname.startsWith("/admin")) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString(),
        );
        if (payload.role !== "admin") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
    // 👆 END OF NEW BLOCK
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/scoreboard/:path*"],
};
