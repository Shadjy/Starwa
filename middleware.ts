import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ["/", "/login", "/register"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Role-based dashboard redirects
    if (pathname === "/dashboard") {
      if (role === "werkgever") {
        return NextResponse.redirect(new URL("/dashboard/werkgever", request.url))
      } else if (role === "werkzoeker") {
        return NextResponse.redirect(new URL("/dashboard/werkzoeker", request.url))
      } else if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*", "/messages/:path*"],
}
