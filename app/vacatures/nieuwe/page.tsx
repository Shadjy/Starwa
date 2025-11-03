"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { ArrowLeft, Briefcase, MapPin, Euro, Clock, FileText, Gift } from "lucide-react"
import Link from "next/link"

export default function NewVacancyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary_min: "",
    salary_max: "",
    employment_type: "fulltime",
    remote_option: "onsite",
    experience_level: "medior",
    requirements: "",
    benefits: "",
    deadline: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/vacancies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fout bij aanmaken vacature")
        setLoading(false)
        return
      }

      router.push("/dashboard/werkgever?message=Vacature succesvol aangemaakt!")
    } catch (err) {
      setError("Kan geen verbinding maken met de server")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen gradient-bg py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/dashboard/werkgever"
            className="inline-flex items-center text-[#8b7355] hover:text-[#d4a574] font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar dashboard
          </Link>
          <h1 className="text-4xl font-bold text-[#3d2f1f] mb-2">Nieuwe Vacature</h1>
          <p className="text-[#8b7355] text-lg">Vind de perfecte kandidaat voor je openstaande positie</p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#f0dfc8] shadow-2xl p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#f0dfc8]">
                <Briefcase className="w-6 h-6 text-[#d4a574]" />
                <h2 className="text-2xl font-bold text-[#3d2f1f]">Basis Informatie</h2>
              </div>

              <div>
                <Label htmlFor="title" className="text-[#3d2f1f] font-semibold text-base">
                  Functietitel *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="bijv. Senior Frontend Developer"
                  className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] h-12"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#3d2f1f] font-semibold text-base">
                  Functieomschrijving *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Beschrijf de functie, verantwoordelijkheden en wat je zoekt in een kandidaat..."
                  className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] min-h-[200px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location" className="text-[#3d2f1f] font-semibold text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Locatie *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="bijv. Amsterdam"
                    className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="remote_option" className="text-[#3d2f1f] font-semibold text-base">
                    Werklocatie Type
                  </Label>
                  <select
                    id="remote_option"
                    name="remote_option"
                    value={formData.remote_option}
                    onChange={handleChange}
                    className="mt-2 w-full border-2 border-[#f0dfc8] focus:border-[#d4a574] rounded-md h-12 px-3"
                  >
                    <option value="onsite">Op kantoor</option>
                    <option value="hybrid">Hybride</option>
                    <option value="remote">Volledig remote</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#f0dfc8]">
                <Clock className="w-6 h-6 text-[#d4a574]" />
                <h2 className="text-2xl font-bold text-[#3d2f1f]">Arbeidsvoorwaarden</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="employment_type" className="text-[#3d2f1f] font-semibold text-base">
                    Dienstverband
                  </Label>
                  <select
                    id="employment_type"
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="mt-2 w-full border-2 border-[#f0dfc8] focus:border-[#d4a574] rounded-md h-12 px-3"
                  >
                    <option value="fulltime">Fulltime</option>
                    <option value="parttime">Parttime</option>
                    <option value="freelance">Freelance</option>
                    <option value="stage">Stage</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="experience_level" className="text-[#3d2f1f] font-semibold text-base">
                    Ervaringsniveau
                  </Label>
                  <select
                    id="experience_level"
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="mt-2 w-full border-2 border-[#f0dfc8] focus:border-[#d4a574] rounded-md h-12 px-3"
                  >
                    <option value="junior">Junior (0-2 jaar)</option>
                    <option value="medior">Medior (2-5 jaar)</option>
                    <option value="senior">Senior (5+ jaar)</option>
                    <option value="lead">Lead/Principal</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="salary_min"
                    className="text-[#3d2f1f] font-semibold text-base flex items-center gap-2"
                  >
                    <Euro className="w-4 h-4" />
                    Salaris Min (per maand)
                  </Label>
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={handleChange}
                    placeholder="bijv. 3000"
                    className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] h-12"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="salary_max"
                    className="text-[#3d2f1f] font-semibold text-base flex items-center gap-2"
                  >
                    <Euro className="w-4 h-4" />
                    Salaris Max (per maand)
                  </Label>
                  <Input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={handleChange}
                    placeholder="bijv. 5000"
                    className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline" className="text-[#3d2f1f] font-semibold text-base">
                  Sluitingsdatum
                </Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] h-12"
                />
              </div>
            </div>

            {/* Requirements & Benefits */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#f0dfc8]">
                <FileText className="w-6 h-6 text-[#d4a574]" />
                <h2 className="text-2xl font-bold text-[#3d2f1f]">Vereisten & Voordelen</h2>
              </div>

              <div>
                <Label htmlFor="requirements" className="text-[#3d2f1f] font-semibold text-base">
                  Functie-eisen
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Lijst met vereiste skills, ervaring, opleidingen, etc."
                  className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="benefits" className="text-[#3d2f1f] font-semibold text-base flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Wat bieden wij?
                </Label>
                <Textarea
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Secundaire arbeidsvoorwaarden, voordelen, ontwikkelmogelijkheden, etc."
                  className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] min-h-[120px]"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-[#f0dfc8]">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              >
                {loading ? "Bezig met opslaan..." : "Vacature Publiceren"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="px-8 py-6 border-2 border-[#f0dfc8] hover:border-[#d4a574] text-[#8b7355] font-semibold rounded-xl"
              >
                Annuleren
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
