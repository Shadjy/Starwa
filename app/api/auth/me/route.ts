import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { getUserById, getUserProfile } from "@/lib/auth"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const user = await getUserById(userId)
    const profile = await getUserProfile(userId)

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
    })
  } catch (error) {
    console.error("[v0] Auth verification error:", error)
    return NextResponse.json({ error: "Ongeldige sessie" }, { status: 401 })
  }
}
