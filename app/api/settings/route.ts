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

    await jwtVerify(token, JWT_SECRET)

    const settings = await query("SELECT * FROM settings ORDER BY setting_key")

    // Convert to key-value object
    const settingsObj: Record<string, any> = {}
    for (const setting of settings as any[]) {
      settingsObj[setting.setting_key] = setting.setting_value
    }

    return NextResponse.json({ settings: settingsObj })
  } catch (error) {
    console.error("[v0] Error fetching settings:", error)
    return NextResponse.json({ error: "Fout bij ophalen instellingen" }, { status: 500 })
  }
}

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
    const { setting_key, setting_value, setting_type } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json({ error: "Setting key en value zijn verplicht" }, { status: 400 })
    }

    // Check if setting exists
    const existing = await queryOne("SELECT id FROM settings WHERE setting_key = ?", [setting_key])

    if (existing) {
      // Update existing setting
      await query("UPDATE settings SET setting_value = ?, setting_type = ? WHERE setting_key = ?", [
        setting_value,
        setting_type || "text",
        setting_key,
      ])
    } else {
      // Insert new setting
      await query("INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)", [
        setting_key,
        setting_value,
        setting_type || "text",
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating setting:", error)
    return NextResponse.json({ error: "Fout bij opslaan instelling" }, { status: 500 })
  }
}
