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
    const role = payload.role as string

    if (role !== "werkzoeker") {
      return NextResponse.json({ error: "Alleen werkzoekers kunnen solliciteren" }, { status: 403 })
    }

    const body = await request.json()
    const { vacancy_id, cover_letter } = body

    if (!vacancy_id) {
      return NextResponse.json({ error: "Vacature ID is verplicht" }, { status: 400 })
    }

    // Check if already applied
    const existing = await query("SELECT id FROM applications WHERE vacancy_id = ? AND user_id = ?", [
      vacancy_id,
      userId,
    ])

    if (existing.length > 0) {
      return NextResponse.json({ error: "Je hebt al gesolliciteerd op deze vacature" }, { status: 409 })
    }

    // Calculate match score (basic algorithm for now)
    const matchScore = await calculateMatchScore(userId, vacancy_id)

    await query(
      "INSERT INTO applications (vacancy_id, user_id, cover_letter, match_score, status) VALUES (?, ?, ?, ?, 'pending')",
      [vacancy_id, userId, cover_letter || null, matchScore],
    )

    return NextResponse.json({ success: true, match_score: matchScore })
  } catch (error) {
    console.error("[v0] Error creating application:", error)
    return NextResponse.json({ error: "Fout bij solliciteren" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number
    const role = payload.role as string

    let applications

    if (role === "werkzoeker") {
      // Get applications for job seeker
      applications = await query(
        `SELECT a.*, v.title, v.location, v.employment_type, v.salary_min, v.salary_max,
         p.company_name as employer_name
         FROM applications a
         JOIN vacancies v ON a.vacancy_id = v.id
         JOIN profiles p ON v.employer_id = p.user_id
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC`,
        [userId],
      )
    } else if (role === "werkgever") {
      // Get applications for employer's vacancies
      applications = await query(
        `SELECT a.*, v.title, v.location,
         p.first_name, p.last_name, p.bio, u.email
         FROM applications a
         JOIN vacancies v ON a.vacancy_id = v.id
         JOIN users u ON a.user_id = u.id
         JOIN profiles p ON a.user_id = p.user_id
         WHERE v.employer_id = ?
         ORDER BY a.created_at DESC`,
        [userId],
      )
    } else {
      return NextResponse.json({ error: "Ongeldige rol" }, { status: 403 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[v0] Error fetching applications:", error)
    return NextResponse.json({ error: "Fout bij ophalen sollicitaties" }, { status: 500 })
  }
}

async function calculateMatchScore(userId: number, vacancyId: number): Promise<number> {
  try {
    // Get user skills
    const userSkills = await query(`SELECT skill_id, proficiency_level FROM user_skills WHERE user_id = ?`, [userId])

    // Get vacancy required skills
    const vacancySkills = await query(
      `SELECT skill_id, required, importance FROM vacancy_skills WHERE vacancy_id = ?`,
      [vacancyId],
    )

    if (vacancySkills.length === 0) {
      return 75 // Default score if no skills specified
    }

    const userSkillIds = new Set(userSkills.map((s: any) => s.skill_id))
    let totalScore = 0
    let maxScore = 0

    for (const vs of vacancySkills as any[]) {
      const importanceWeight =
        vs.importance === "critical" ? 4 : vs.importance === "high" ? 3 : vs.importance === "medium" ? 2 : 1
      maxScore += importanceWeight * 100

      if (userSkillIds.has(vs.skill_id)) {
        totalScore += importanceWeight * 100
      }
    }

    const matchPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 75

    return Math.round(matchPercentage)
  } catch (error) {
    console.error("[v0] Error calculating match score:", error)
    return 50 // Default fallback score
  }
}
