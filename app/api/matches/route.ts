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

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number
    const role = payload.role as string

    let matches

    if (role === "werkgever") {
      // Get matches for employer's vacancies
      matches = await query(
        `SELECT m.*, v.title as vacancy_title, 
         p.first_name, p.last_name, p.location, u.email
         FROM matches m
         JOIN vacancies v ON m.vacancy_id = v.id
         JOIN users u ON m.candidate_id = u.id
         LEFT JOIN profiles p ON m.candidate_id = p.user_id
         WHERE v.employer_id = ?
         ORDER BY m.created_at DESC
         LIMIT 20`,
        [userId],
      )
    } else {
      // Get matches for job seeker
      matches = await query(
        `SELECT m.*, v.title as vacancy_title, v.description, v.location,
         p.company_name
         FROM matches m
         JOIN vacancies v ON m.vacancy_id = v.id
         LEFT JOIN profiles p ON v.employer_id = p.user_id
         WHERE m.candidate_id = ?
         ORDER BY m.created_at DESC
         LIMIT 20`,
        [userId],
      )
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("[v0] Error fetching matches:", error)
    return NextResponse.json({ error: "Fout bij ophalen matches" }, { status: 500 })
  }
}
