import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number
    const role = payload.role as string

    if (role !== "werkgever") {
      return NextResponse.json({ error: "Alleen werkgevers kunnen vacatures aanmaken" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, location, salary_min, salary_max, employment_type, requirements, benefits } = body

    if (!title || !description || !location) {
      return NextResponse.json({ error: "Titel, beschrijving en locatie zijn verplicht" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO vacancies 
       (employer_id, title, description, location, salary_min, salary_max, employment_type, requirements, benefits, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        userId,
        title,
        description,
        location,
        salary_min || null,
        salary_max || null,
        employment_type || "fulltime",
        requirements || null,
        benefits || null,
      ],
    )

    const vacancyId = (result as any).insertId

    return NextResponse.json({
      success: true,
      vacancy: {
        id: vacancyId,
        title,
        description,
        location,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating vacancy:", error)
    return NextResponse.json({ error: "Fout bij aanmaken vacature" }, { status: 500 })
  }
}
