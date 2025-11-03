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

    const body = await request.json()
    const { responses } = body

    if (!responses || typeof responses !== "object") {
      return NextResponse.json({ error: "Ongeldige vragenlijst data" }, { status: 400 })
    }

    // Save questionnaire responses
    for (const [key, value] of Object.entries(responses)) {
      await query(
        `INSERT INTO questionnaire_responses (user_id, question_key, answer) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE answer = VALUES(answer)`,
        [userId, key, value],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving questionnaire:", error)
    return NextResponse.json({ error: "Fout bij opslaan vragenlijst" }, { status: 500 })
  }
}
