import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number
    const role = payload.role as string

    const applicationId = params.id
    const body = await request.json()
    const { status } = body

    // Only employers can update application status
    if (role !== "werkgever") {
      return NextResponse.json({ error: "Alleen werkgevers kunnen sollicitaties bijwerken" }, { status: 403 })
    }

    // Verify the application belongs to employer's vacancy
    const applications = await query(
      `SELECT a.*, v.employer_id FROM applications a
       JOIN vacancies v ON a.vacancy_id = v.id
       WHERE a.id = ?`,
      [applicationId],
    )

    if (!Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json({ error: "Sollicitatie niet gevonden" }, { status: 404 })
    }

    if (applications[0].employer_id !== userId) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    // Update application status
    await query(`UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?`, [status, applicationId])

    // Create notification for candidate
    await query(
      `INSERT INTO notifications (user_id, type, title, content, link)
       VALUES (?, 'application', ?, ?, ?)`,
      [
        applications[0].user_id,
        "Sollicitatie update",
        `Je sollicitatie is ${status === "accepted" ? "geaccepteerd" : status === "rejected" ? "afgewezen" : "bijgewerkt"}`,
        `/dashboard/werkzoeker/sollicitaties/${applicationId}`,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating application:", error)
    return NextResponse.json({ error: "Fout bij bijwerken sollicitatie" }, { status: 500 })
  }
}
