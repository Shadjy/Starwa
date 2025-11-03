import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { query } from "@/lib/db"
import { spawn } from "child_process"
import path from "path"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    // Get candidate profile and skills
    const profiles = await query(
      `SELECT p.*, GROUP_CONCAT(s.skill_name) as skills
       FROM profiles p
       LEFT JOIN user_skills us ON p.user_id = us.user_id
       LEFT JOIN skills s ON us.skill_id = s.id
       WHERE p.user_id = ?
       GROUP BY p.id`,
      [userId],
    )

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 })
    }

    const profile = profiles[0]

    // Get all active vacancies with their required skills
    const vacancies = await query(
      `SELECT v.*, GROUP_CONCAT(s.skill_name) as required_skills
       FROM vacancies v
       LEFT JOIN vacancy_skills vs ON v.id = vs.vacancy_id
       LEFT JOIN skills s ON vs.skill_id = s.id
       WHERE v.status = 'active'
       GROUP BY v.id`,
    )

    // Prepare data for Python algorithm
    const candidateData = {
      id: userId,
      skills: profile.skills ? profile.skills.split(",") : [],
      experience_years: profile.years_experience || 0,
      education_level: profile.education_level || "",
      preferred_location: profile.preferred_location || "",
      remote_preference: profile.remote_preference || "flexible",
      availability: profile.availability || "immediate",
    }

    const vacanciesData = Array.isArray(vacancies)
      ? vacancies.map((v: any) => ({
          id: v.id,
          title: v.title,
          required_skills: v.required_skills ? v.required_skills.split(",") : [],
          experience_level: v.experience_level || "medior",
          location: v.location || "",
          remote_option: v.remote_option || "onsite",
          employment_type: v.employment_type || "fulltime",
        }))
      : []

    // Run Python matching algorithm
    const pythonScript = path.join(process.cwd(), "scripts", "matching_algorithm.py")
    const inputData = JSON.stringify({
      candidate: candidateData,
      vacancies: vacanciesData,
    })

    const pythonProcess = spawn("python3", [pythonScript, inputData])

    let result = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString()
    })

    return new Promise((resolve) => {
      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          console.error("[v0] Python matching error:", error)
          resolve(NextResponse.json({ error: "Fout bij matching algoritme" }, { status: 500 }))
          return
        }

        try {
          const matchResults = JSON.parse(result)

          // Store matches in database
          for (const match of matchResults.matches) {
            if (match.overall_score >= 50) {
              // Only store matches above 50%
              await query(
                `INSERT INTO matches (user_id, vacancy_id, match_score, status)
                 VALUES (?, ?, ?, 'pending')
                 ON DUPLICATE KEY UPDATE match_score = ?, updated_at = CURRENT_TIMESTAMP`,
                [userId, match.vacancy_id, match.overall_score, match.overall_score],
              )
            }
          }

          resolve(NextResponse.json(matchResults))
        } catch (parseError) {
          console.error("[v0] Error parsing Python output:", parseError)
          resolve(NextResponse.json({ error: "Fout bij verwerken matching resultaten" }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error("[v0] Error in matching:", error)
    return NextResponse.json({ error: "Fout bij matching" }, { status: 500 })
  }
}
