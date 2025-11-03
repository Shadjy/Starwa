import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    // Validatie
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, wachtwoord en rol zijn verplicht" }, { status: 400 })
    }

    if (!["werkgever", "werkzoeker"].includes(role)) {
      return NextResponse.json({ error: "Ongeldige rol geselecteerd" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Wachtwoord moet minimaal 6 karakters bevatten" }, { status: 400 })
    }

    // Maak gebruiker aan
    const user = await createUser(email, password, role)

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Registration error:", error)

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Dit e-mailadres is al geregistreerd" }, { status: 409 })
    }

    return NextResponse.json({ error: "Er is een fout opgetreden bij het registreren" }, { status: 500 })
  }
}
