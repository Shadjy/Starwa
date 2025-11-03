import { NextResponse } from "next/server"
import { getThemeSettings } from "@/lib/theme"

export async function GET() {
  try {
    const theme = await getThemeSettings()
    return NextResponse.json({ theme })
  } catch (error) {
    console.error("[v0] Error fetching theme:", error)
    return NextResponse.json(
      {
        theme: {
          primaryColor: "#8b7355",
          secondaryColor: "#d4c5b9",
          backgroundColor: "#faf8f5",
          textColor: "#2c2416",
          accentColor: "#a67c52",
        },
      },
      { status: 200 },
    )
  }
}

export const dynamic = "force-dynamic"
