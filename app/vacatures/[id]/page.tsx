"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { ArrowLeft, MapPin, Briefcase, Clock, Euro, Heart, Send, Building2, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Vacancy {
  id: number
  title: string
  description: string
  location: string
  salary_min: number
  salary_max: number
  employment_type: string
  remote_option: string
  experience_level: string
  requirements: string
  benefits: string
  deadline: string
  company_name: string
  views: number
  applications_count: number
  created_at: string
}

export default function VacancyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vacancy, setVacancy] = useState<Vacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVacancy()
  }, [params.id])

  const fetchVacancy = async () => {
    try {
      const response = await fetch(`/api/vacancies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setVacancy(data.vacancy)
        setIsSaved(data.isSaved || false)
        setHasApplied(data.hasApplied || false)
      }
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching vacancy:", error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/vacancies/${params.id}/save`, {
        method: "POST",
      })
      if (response.ok) {
        setIsSaved(!isSaved)
      }
    } catch (error) {
      console.error("[v0] Error saving vacancy:", error)
    }
  }

  const handleApply = async () => {
    try {
      const response = await fetch(`/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancy_id: params.id }),
      })

      if (response.ok) {
        setHasApplied(true)
        setShowApplyModal(false)
        setError("")
      } else {
        const data = await response.json()
        setError(data.error || "Fout bij solliciteren")
      }
    } catch (error) {
      setError("Kan geen verbinding maken met de server")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-[#8b7355] text-lg">Laden...</div>
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#3d2f1f] mb-4">Vacature niet gevonden</h2>
          <Link href="/dashboard/werkzoeker">
            <Button>Terug naar dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fulltime: "Fulltime",
      parttime: "Parttime",
      freelance: "Freelance",
      stage: "Stage",
    }
    return labels[type] || type
  }

  const getRemoteLabel = (type: string) => {
    const labels: Record<string, string> = {
      onsite: "Op kantoor",
      hybrid: "Hybride",
      remote: "Volledig remote",
    }
    return labels[type] || type
  }

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      junior: "Junior (0-2 jaar)",
      medior: "Medior (2-5 jaar)",
      senior: "Senior (5+ jaar)",
      lead: "Lead/Principal",
    }
    return labels[level] || level
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/dashboard/werkzoeker"
            className="inline-flex items-center text-[#8b7355] hover:text-[#d4a574] font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar overzicht
          </Link>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#f0dfc8] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#ffeaa7] to-[#f5e6d3] p-8 border-b-2 border-[#f0dfc8]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-[#3d2f1f] mb-3">{vacancy.title}</h1>
                <div className="flex items-center gap-2 text-[#8b7355] text-lg mb-4">
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold">{vacancy.company_name || "Bedrijfsnaam"}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSave}
                  className={`border-2 ${isSaved ? "bg-[#d4a574] text-white border-[#d4a574]" : "border-[#f0dfc8] hover:border-[#d4a574]"}`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                </Button>
                {hasApplied ? (
                  <Button size="lg" disabled className="bg-[#9bc49f] text-white">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Gesolliciteerd
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => setShowApplyModal(true)}
                    className="bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold shadow-lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Solliciteer Nu
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white text-[#3d2f1f] border-2 border-[#f0dfc8] px-4 py-2 text-sm font-semibold">
                <Briefcase className="w-4 h-4 mr-2" />
                {getEmploymentTypeLabel(vacancy.employment_type)}
              </Badge>
              <Badge className="bg-white text-[#3d2f1f] border-2 border-[#f0dfc8] px-4 py-2 text-sm font-semibold">
                <MapPin className="w-4 h-4 mr-2" />
                {vacancy.location}
              </Badge>
              <Badge className="bg-white text-[#3d2f1f] border-2 border-[#f0dfc8] px-4 py-2 text-sm font-semibold">
                <Clock className="w-4 h-4 mr-2" />
                {getRemoteLabel(vacancy.remote_option)}
              </Badge>
              {vacancy.salary_min && vacancy.salary_max && (
                <Badge className="bg-white text-[#3d2f1f] border-2 border-[#f0dfc8] px-4 py-2 text-sm font-semibold">
                  <Euro className="w-4 h-4 mr-2" />€ {vacancy.salary_min} - € {vacancy.salary_max}
                </Badge>
              )}
              <Badge className="bg-white text-[#3d2f1f] border-2 border-[#f0dfc8] px-4 py-2 text-sm font-semibold">
                <Users className="w-4 h-4 mr-2" />
                {getExperienceLabel(vacancy.experience_level)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-[#faf8f5] rounded-xl border border-[#f0dfc8]">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4a574] mb-1">{vacancy.views || 0}</div>
                <div className="text-sm text-[#8b7355]">Weergaven</div>
              </div>
              <div className="text-center border-x border-[#f0dfc8]">
                <div className="text-3xl font-bold text-[#d4a574] mb-1">{vacancy.applications_count || 0}</div>
                <div className="text-sm text-[#8b7355]">Sollicitaties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#d4a574] mb-1">
                  {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString("nl-NL") : "Open"}
                </div>
                <div className="text-sm text-[#8b7355]">Sluitingsdatum</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-[#3d2f1f] mb-4 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-[#d4a574]" />
                Functieomschrijving
              </h2>
              <div className="prose prose-lg max-w-none text-[#6b5d4f]">
                <p className="whitespace-pre-wrap">{vacancy.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {vacancy.requirements && (
              <div>
                <h2 className="text-2xl font-bold text-[#3d2f1f] mb-4">Wat vragen wij?</h2>
                <div className="prose prose-lg max-w-none text-[#6b5d4f]">
                  <p className="whitespace-pre-wrap">{vacancy.requirements}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {vacancy.benefits && (
              <div>
                <h2 className="text-2xl font-bold text-[#3d2f1f] mb-4">Wat bieden wij?</h2>
                <div className="prose prose-lg max-w-none text-[#6b5d4f]">
                  <p className="whitespace-pre-wrap">{vacancy.benefits}</p>
                </div>
              </div>
            )}

            {/* Apply CTA */}
            {!hasApplied && (
              <div className="bg-gradient-to-r from-[#ffeaa7] to-[#f5e6d3] p-8 rounded-xl border-2 border-[#f0dfc8] text-center">
                <h3 className="text-2xl font-bold text-[#3d2f1f] mb-3">Interesse in deze functie?</h3>
                <p className="text-[#8b7355] mb-6">Solliciteer nu en maak kans op deze geweldige kans!</p>
                <Button
                  size="lg"
                  onClick={() => setShowApplyModal(true)}
                  className="bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold px-12 py-6 text-lg shadow-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Solliciteer Nu
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border-2 border-[#f0dfc8] p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-[#3d2f1f] mb-4">Sollicitatie bevestigen</h3>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  {error}
                </Alert>
              )}
              <p className="text-[#8b7355] mb-6">
                Weet je zeker dat je wilt solliciteren op <strong>{vacancy.title}</strong>?
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold"
                >
                  Ja, solliciteer
                </Button>
                <Button variant="outline" onClick={() => setShowApplyModal(false)} className="flex-1">
                  Annuleren
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
