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

    const vacancies = await query(
      `SELECT v.*, p.company_name 
       FROM vacancies v 
       LEFT JOIN profiles p ON v.employer_id = p.user_id 
       WHERE v.employer_id = ? 
       ORDER BY v.created_at DESC`,
      [userId],
    )

    return NextResponse.json({ vacancies })
  } catch (error) {
    console.error("[v0] Error fetching vacancies:", error)
    return NextResponse.json({ error: "Fout bij ophalen vacatures" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const body = await request.json()
    const { title, description, location, salary_range, employment_type, status } = body

    if (!title) {
      return NextResponse.json({ error: "Titel is verplicht" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO vacancies (employer_id, title, description, location, salary_range, employment_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        description || null,
        location || null,
        salary_range || null,
        employment_type || "fulltime",
        status || "draft",
      ],
    )

    return NextResponse.json({ success: true, id: result[0]?.insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating vacancy:", error)
    return NextResponse.json({ error: "Fout bij aanmaken vacature" }, { status: 500 })
  }
}
