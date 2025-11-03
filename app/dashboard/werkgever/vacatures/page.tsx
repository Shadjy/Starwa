"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, MapPin, Briefcase, Euro, Edit, Trash2 } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"

export default function VacaturesPage() {
  const router = useRouter()
  const [vacancies, setVacancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVacancies()
  }, [])

  const fetchVacancies = async () => {
    try {
      const response = await fetch("/api/vacancies")
      const data = await response.json()
      setVacancies(data.vacancies || [])
    } catch (error) {
      console.error("[v0] Error fetching vacancies:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5f1eb] to-[#ede7df]">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2c2416]">Mijn Vacatures</h1>
            <p className="text-[#6b5d4f] mt-1">Beheer je vacatures en bekijk sollicitaties</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/werkgever/vacatures/nieuw")}
            className="bg-gradient-to-r from-[#8b7355] to-[#a67c52] hover:from-[#6b5d4f] hover:to-[#8b7355] text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Vacature
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#8b7355] border-t-transparent"></div>
          </div>
        ) : vacancies.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed border-[#e5ddd5]">
            <Briefcase className="w-16 h-16 mx-auto text-[#d4c5b9] mb-4" />
            <h3 className="text-xl font-semibold text-[#2c2416] mb-2">Nog geen vacatures</h3>
            <p className="text-[#6b5d4f] mb-6">Plaats je eerste vacature en vind de perfecte kandidaat</p>
            <Button
              onClick={() => router.push("/dashboard/werkgever/vacatures/nieuw")}
              className="bg-gradient-to-r from-[#8b7355] to-[#a67c52] hover:from-[#6b5d4f] hover:to-[#8b7355] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Vacature Plaatsen
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {vacancies.map((vacancy) => (
              <Card key={vacancy.id} className="p-6 hover:shadow-xl transition-shadow border-[#e5ddd5]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-[#2c2416]">{vacancy.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vacancy.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {vacancy.status === "active" ? "Actief" : "Inactief"}
                      </span>
                    </div>

                    <p className="text-[#6b5d4f] mb-4 line-clamp-2">{vacancy.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-[#6b5d4f]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vacancy.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {vacancy.employment_type === "fulltime"
                          ? "Fulltime"
                          : vacancy.employment_type === "parttime"
                            ? "Parttime"
                            : "Freelance"}
                      </div>
                      {vacancy.salary_min && (
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />€{vacancy.salary_min} - €{vacancy.salary_max}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-[#e5ddd5] bg-transparent">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#e5ddd5] text-red-600 hover:text-red-700 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#e5ddd5] flex items-center justify-between">
                  <div className="text-sm text-[#6b5d4f]">
                    <span className="font-semibold text-[#2c2416]">{vacancy.application_count || 0}</span> sollicitaties
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/werkgever/vacatures/${vacancy.id}`)}
                    className="border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white"
                  >
                    Bekijk Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
