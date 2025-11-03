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

    const messages = await query(
      `SELECT m.*, 
       sender.email as sender_email, 
       sender_profile.first_name as sender_first_name,
       sender_profile.last_name as sender_last_name,
       receiver.email as receiver_email,
       receiver_profile.first_name as receiver_first_name,
       receiver_profile.last_name as receiver_last_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       LEFT JOIN profiles sender_profile ON m.sender_id = sender_profile.user_id
       LEFT JOIN profiles receiver_profile ON m.receiver_id = receiver_profile.user_id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [userId, userId],
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ error: "Fout bij ophalen berichten" }, { status: 500 })
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
    const { receiver_id, subject, content } = body

    if (!receiver_id || !content) {
      return NextResponse.json({ error: "Ontvanger en bericht zijn verplicht" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, subject, content) 
       VALUES (?, ?, ?, ?)`,
      [userId, receiver_id, subject || null, content],
    )

    return NextResponse.json({ success: true, id: result[0]?.insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ error: "Fout bij versturen bericht" }, { status: 500 })
  }
}
