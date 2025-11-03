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

    // Get all conversations for this user
    const conversations = await query(
      `SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        p.first_name,
        p.last_name,
        p.company_name,
        p.avatar_url,
        u.role,
        MAX(m.created_at) as last_message_time,
        (SELECT content FROM messages m2 
         WHERE (m2.sender_id = ? AND m2.receiver_id = other_user_id)
            OR (m2.receiver_id = ? AND m2.sender_id = other_user_id)
         ORDER BY m2.created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages m3
         WHERE m3.receiver_id = ? AND m3.sender_id = other_user_id AND m3.is_read = FALSE) as unread_count
       FROM messages m
       JOIN users u ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END = u.id)
       JOIN profiles p ON u.id = p.user_id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       GROUP BY other_user_id, p.first_name, p.last_name, p.company_name, p.avatar_url, u.role
       ORDER BY last_message_time DESC`,
      [userId, userId, userId, userId, userId, userId, userId],
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error)
    return NextResponse.json({ error: "Fout bij ophalen gesprekken" }, { status: 500 })
  }
}
