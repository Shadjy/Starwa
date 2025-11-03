import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vacancyId = params.id

    // Get vacancy details
    const vacancies = await query(
      `SELECT v.*, u.email as employer_email, p.first_name, p.last_name, p.company_name
       FROM vacancies v
       LEFT JOIN users u ON v.employer_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE v.id = ?`,
      [vacancyId],
    )

    if (!Array.isArray(vacancies) || vacancies.length === 0) {
      return NextResponse.json({ error: "Vacature niet gevonden" }, { status: 404 })
    }

    const vacancy = vacancies[0]

    // Increment view count
    await query(`UPDATE vacancies SET views = views + 1 WHERE id = ?`, [vacancyId])

    // Check if user is logged in
    const token = request.cookies.get("auth-token")?.value
    let isSaved = false
    let hasApplied = false

    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        const userId = payload.userId as number

        // Check if saved
        const savedCheck = await query(`SELECT id FROM saved_vacancies WHERE user_id = ? AND vacancy_id = ?`, [
          userId,
          vacancyId,
        ])
        isSaved = Array.isArray(savedCheck) && savedCheck.length > 0

        // Check if applied
        const appliedCheck = await query(`SELECT id FROM applications WHERE user_id = ? AND vacancy_id = ?`, [
          userId,
          vacancyId,
        ])
        hasApplied = Array.isArray(appliedCheck) && appliedCheck.length > 0

        // Track view
        await query(`INSERT INTO vacancy_views (vacancy_id, user_id) VALUES (?, ?)`, [vacancyId, userId])
      } catch (error) {
        // Token invalid, continue without user data
      }
    }

    return NextResponse.json({
      vacancy,
      isSaved,
      hasApplied,
    })
  } catch (error) {
    console.error("[v0] Error fetching vacancy:", error)
    return NextResponse.json({ error: "Fout bij ophalen vacature" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const vacancyId = params.id
    const body = await request.json()

    // Check if user owns this vacancy
    const vacancies = await query(`SELECT employer_id FROM vacancies WHERE id = ?`, [vacancyId])

    if (!Array.isArray(vacancies) || vacancies.length === 0) {
      return NextResponse.json({ error: "Vacature niet gevonden" }, { status: 404 })
    }

    if (vacancies[0].employer_id !== userId) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    // Update vacancy
    await query(
      `UPDATE vacancies SET 
       title = ?, description = ?, location = ?, salary_min = ?, salary_max = ?,
       employment_type = ?, remote_option = ?, experience_level = ?,
       requirements = ?, benefits = ?, deadline = ?
       WHERE id = ?`,
      [
        body.title,
        body.description,
        body.location,
        body.salary_min || null,
        body.salary_max || null,
        body.employment_type,
        body.remote_option,
        body.experience_level,
        body.requirements || null,
        body.benefits || null,
        body.deadline || null,
        vacancyId,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating vacancy:", error)
    return NextResponse.json({ error: "Fout bij bijwerken vacature" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const vacancyId = params.id

    // Check if user owns this vacancy
    const vacancies = await query(`SELECT employer_id FROM vacancies WHERE id = ?`, [vacancyId])

    if (!Array.isArray(vacancies) || vacancies.length === 0) {
      return NextResponse.json({ error: "Vacature niet gevonden" }, { status: 404 })
    }

    if (vacancies[0].employer_id !== userId) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    // Delete vacancy
    await query(`DELETE FROM vacancies WHERE id = ?`, [vacancyId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting vacancy:", error)
    return NextResponse.json({ error: "Fout bij verwijderen vacature" }, { status: 500 })
  }
}
