import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query, queryOne } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const profile = await queryOne("SELECT * FROM profiles WHERE user_id = ?", [userId])

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return NextResponse.json({ error: "Fout bij ophalen profiel" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    const body = await request.json()
    const { first_name, last_name, company_name, phone, location, bio, questionnaire_completed } = body

    await query(
      `UPDATE profiles 
       SET first_name = ?, last_name = ?, company_name = ?, phone = ?, location = ?, bio = ?, questionnaire_completed = ?
       WHERE user_id = ?`,
      [
        first_name || null,
        last_name || null,
        company_name || null,
        phone || null,
        location || null,
        bio || null,
        questionnaire_completed !== undefined ? questionnaire_completed : false,
        userId,
      ],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json({ error: "Fout bij bijwerken profiel" }, { status: 500 })
  }
}
