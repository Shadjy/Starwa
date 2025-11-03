import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    await jwtVerify(token, JWT_SECRET)

    // Get all active vacancies with employer info
    const vacancies = await query(
      `SELECT v.*, p.company_name, p.location as company_location
       FROM vacancies v 
       LEFT JOIN profiles p ON v.employer_id = p.user_id 
       WHERE v.status = 'active'
       ORDER BY v.created_at DESC
       LIMIT 50`,
    )

    return NextResponse.json({ vacancies })
  } catch (error) {
    console.error("[v0] Error fetching all vacancies:", error)
    return NextResponse.json({ error: "Fout bij ophalen vacatures" }, { status: 500 })
  }
}
