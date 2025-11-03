import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query, queryOne } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    if (role !== "admin") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Ongeldige settings data" }, { status: 400 })
    }

    // Update all settings
    for (const [key, value] of Object.entries(settings)) {
      const existing = await queryOne("SELECT id FROM settings WHERE setting_key = ?", [key])

      if (existing) {
        await query("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [value, key])
      } else {
        await query("INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)", [
          key,
          value,
          "text",
        ])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error bulk updating settings:", error)
    return NextResponse.json({ error: "Fout bij opslaan instellingen" }, { status: 500 })
  }
}
