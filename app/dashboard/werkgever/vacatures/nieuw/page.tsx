"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { ArrowLeft, Upload, X } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"

export default function NieuweVacaturePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary_min: "",
    salary_max: "",
    employment_type: "fulltime",
    requirements: "",
    benefits: "",
    company_culture: "",
    team_size: "",
    work_environment: "",
    application_deadline: "",
    contact_email: "",
    contact_phone: "",
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/vacancies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photos }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fout bij aanmaken vacature")
        setLoading(false)
        return
      }

      router.push("/dashboard/werkgever/vacatures")
    } catch (err) {
      setError("Er is een fout opgetreden")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5f1eb] to-[#ede7df]">
      <DashboardNav role="werkgever" />

      <main className="flex-1 p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-[#6b5d4f] hover:text-[#2c2416]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>

        <Card className="max-w-4xl p-8 border-[#e5ddd5] bg-white/80 backdrop-blur">
          <h1 className="text-3xl font-bold text-[#2c2416] mb-2">Nieuwe Vacature</h1>
          <p className="text-[#6b5d4f] mb-8">Vul alle details in voor je nieuwe vacature</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-[#2c2416] font-medium">
                Functietitel *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="bijv. Senior Frontend Developer"
                className="mt-1.5 border-[#e5ddd5]"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-[#2c2416] font-medium">
                Beschrijving *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Beschrijf de functie, verantwoordelijkheden en wat je zoekt..."
                rows={6}
                className="mt-1.5 border-[#e5ddd5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location" className="text-[#2c2416] font-medium">
                  Locatie *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="bijv. Amsterdam, Remote"
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>

              <div>
                <Label htmlFor="employment_type" className="text-[#2c2416] font-medium">
                  Dienstverband
                </Label>
                <select
                  id="employment_type"
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="mt-1.5 w-full px-3 py-2 border border-[#e5ddd5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b7355]"
                >
                  <option value="fulltime">Fulltime</option>
                  <option value="parttime">Parttime</option>
                  <option value="freelance">Freelance</option>
                  <option value="stage">Stage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="salary_min" className="text-[#2c2416] font-medium">
                  Salaris Min (€)
                </Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  placeholder="bijv. 3000"
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>

              <div>
                <Label htmlFor="salary_max" className="text-[#2c2416] font-medium">
                  Salaris Max (€)
                </Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  placeholder="bijv. 5000"
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="requirements" className="text-[#2c2416] font-medium">
                Vereisten
              </Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Lijst de vereiste vaardigheden en ervaring..."
                rows={4}
                className="mt-1.5 border-[#e5ddd5]"
              />
            </div>

            <div>
              <Label htmlFor="benefits" className="text-[#2c2416] font-medium">
                Voordelen
              </Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Wat bied je aan? (bijv. flexibele werktijden, thuiswerken, opleidingsbudget...)"
                rows={4}
                className="mt-1.5 border-[#e5ddd5]"
              />
            </div>

            <div>
              <Label htmlFor="company_culture" className="text-[#2c2416] font-medium">
                Bedrijfscultuur
              </Label>
              <Textarea
                id="company_culture"
                value={formData.company_culture}
                onChange={(e) => setFormData({ ...formData, company_culture: e.target.value })}
                placeholder="Beschrijf de bedrijfscultuur en werksfeer..."
                rows={3}
                className="mt-1.5 border-[#e5ddd5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="team_size" className="text-[#2c2416] font-medium">
                  Teamgrootte
                </Label>
                <Input
                  id="team_size"
                  value={formData.team_size}
                  onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                  placeholder="bijv. 5-10 personen"
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>

              <div>
                <Label htmlFor="work_environment" className="text-[#2c2416] font-medium">
                  Werkomgeving
                </Label>
                <Input
                  id="work_environment"
                  value={formData.work_environment}
                  onChange={(e) => setFormData({ ...formData, work_environment: e.target.value })}
                  placeholder="bijv. Hybride, Kantoor, Remote"
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="application_deadline" className="text-[#2c2416] font-medium">
                  Sollicitatie Deadline
                </Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>

              <div>
                <Label htmlFor="contact_email" className="text-[#2c2416] font-medium">
                  Contact Email
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@bedrijf.nl"
                  className="mt-1.5 border-[#e5ddd5]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_phone" className="text-[#2c2416] font-medium">
                Contact Telefoon
              </Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+31 6 12345678"
                className="mt-1.5 border-[#e5ddd5]"
              />
            </div>

            <div>
              <Label className="text-[#2c2416] font-medium">Foto's</Label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#e5ddd5] rounded-lg hover:border-[#8b7355] transition-colors">
                      <Upload className="w-4 h-4 text-[#6b5d4f]" />
                      <span className="text-sm text-[#6b5d4f]">Upload Foto's</span>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-[#e5ddd5]"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#8b7355] to-[#a67c52] hover:from-[#6b5d4f] hover:to-[#8b7355] text-white py-6"
              >
                {loading ? "Bezig met opslaan..." : "Vacature Plaatsen"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="border-[#e5ddd5]">
                Annuleren
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
