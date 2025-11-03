import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const vacancyId = params.id

    // Check if already saved
    const existing = await query(`SELECT id FROM saved_vacancies WHERE user_id = ? AND vacancy_id = ?`, [
      userId,
      vacancyId,
    ])

    if (Array.isArray(existing) && existing.length > 0) {
      // Unsave
      await query(`DELETE FROM saved_vacancies WHERE user_id = ? AND vacancy_id = ?`, [userId, vacancyId])
      return NextResponse.json({ saved: false })
    } else {
      // Save
      await query(`INSERT INTO saved_vacancies (user_id, vacancy_id) VALUES (?, ?)`, [userId, vacancyId])
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error("[v0] Error saving vacancy:", error)
    return NextResponse.json({ error: "Fout bij opslaan vacature" }, { status: 500 })
  }
}
