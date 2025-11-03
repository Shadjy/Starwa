"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCard } from "@/components/dashboard-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MessageSquare, Heart, Search, MapPin, Clock, Sparkles, Settings } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  role: string
}

interface Vacancy {
  id: number
  title: string
  description: string
  location: string
  salary_range: string
  employment_type: string
  company_name: string
  created_at: string
}

interface Match {
  id: number
  vacancy_title: string
  description: string
  location: string
  company_name: string
  match_score: number
  status: string
}

interface Message {
  id: number
  subject: string
  sender_email: string
  sender_first_name: string
  sender_last_name: string
  is_read: boolean
  created_at: string
}

export default function JobSeekerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me")
        if (!userRes.ok) {
          router.push("/login")
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        // Fetch all vacancies
        const vacanciesRes = await fetch("/api/vacancies/all")
        if (vacanciesRes.ok) {
          const vacanciesData = await vacanciesRes.json()
          setVacancies(vacanciesData.vacancies || [])
        }

        // Fetch matches
        const matchesRes = await fetch("/api/matches")
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }

        // Fetch messages
        const messagesRes = await fetch("/api/messages")
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json()
          setMessages(messagesData.messages || [])
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-[#6b5d4f]">Laden...</div>
      </div>
    )
  }

  const unreadMessages = messages.filter((m) => !m.is_read && m.sender_email !== user?.email).length
  const acceptedMatches = matches.filter((m) => m.status === "accepted").length

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fulltime: "Fulltime",
      parttime: "Parttime",
      freelance: "Freelance",
      stage: "Stage",
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbf5] via-[#ffeaa7]/20 to-[#f5e6d3]/30">
      <DashboardHeader title="Werkzoeker Dashboard" userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-gradient-to-r from-[#d4a574] to-[#e8b86d] p-8 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-4xl font-bold">Welkom terug!</h2>
          </div>
          <p className="text-xl text-white/90">Ontdek nieuwe kansen en vind je droombaan</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Beschikbare Vacatures</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{vacancies.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
                <Search className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Mijn Matches</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{matches.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#9bc49f] to-[#7fb584] rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Ongelezen Berichten</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{unreadMessages}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#e8b86d] to-[#f4c97d] rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Geaccepteerde Matches</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{acceptedMatches}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#d4a574] to-[#a67c52] rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/vacatures">
            <Button className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 shadow-lg hover:shadow-xl transition-all">
              <Search className="w-5 h-5 mr-2" />
              Zoek Vacatures
            </Button>
          </Link>
          <Link href="/favorieten">
            <Button
              variant="outline"
              className="w-full border-2 border-[#d4a574] text-[#d4a574] hover:bg-[#f5e6d3] font-bold py-6 bg-transparent"
            >
              <Heart className="w-5 h-5 mr-2" />
              Mijn Favorieten
            </Button>
          </Link>
          <Link href="/berichten">
            <Button
              variant="outline"
              className="w-full border-2 border-[#d4a574] text-[#d4a574] hover:bg-[#f5e6d3] font-bold py-6 bg-transparent"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Berichten
            </Button>
          </Link>
          <Link href="/instellingen">
            <Button
              variant="outline"
              className="w-full border-2 border-[#d4a574] text-[#d4a574] hover:bg-[#f5e6d3] font-bold py-6 bg-transparent"
            >
              <Settings className="w-5 h-5 mr-2" />
              Instellingen
            </Button>
          </Link>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#3d2f1f]">Aanbevolen Vacatures</h3>
                  <p className="text-sm text-[#8b7355]">Vacatures die bij jouw profiel passen</p>
                </div>
              </div>
              <div className="space-y-4">
                {vacancies.slice(0, 6).map((vacancy) => (
                  <div
                    key={vacancy.id}
                    className="p-4 bg-gradient-to-br from-[#fffbf5] to-[#ffeaa7]/20 rounded-xl border border-[#f0dfc8] card-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2c2416] text-lg mb-1">{vacancy.title}</h4>
                        <p className="text-sm text-[#6b5d4f] mb-2">{vacancy.company_name || "Bedrijfsnaam"}</p>
                      </div>
                      <Badge variant="secondary" className="bg-[#8b7355]/10 text-[#8b7355] border-[#8b7355]/20">
                        {getEmploymentTypeLabel(vacancy.employment_type)}
                      </Badge>
                    </div>

                    <p className="text-sm text-[#6b5d4f] mb-3 line-clamp-2">
                      {vacancy.description || "Geen beschrijving beschikbaar"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-[#6b5d4f] mb-3">
                      {vacancy.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{vacancy.location}</span>
                        </div>
                      )}
                      {vacancy.salary_range && <span>€ {vacancy.salary_range}</span>}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(vacancy.created_at).toLocaleDateString("nl-NL")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/vacatures/${vacancy.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-[#d4a574] hover:bg-[#e8b86d] text-white">
                          Bekijk details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#d4a574] text-[#d4a574] bg-transparent"
                        onClick={() => router.push(`/vacatures/${vacancy.id}?action=apply`)}
                      >
                        Solliciteer
                      </Button>
                    </div>
                  </div>
                ))}
                {vacancies.length === 0 && (
                  <p className="text-center text-[#6b5d4f] py-8">Geen vacatures beschikbaar op dit moment</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mijn Matches */}
            <DashboardCard
              title="Mijn Matches"
              description="Vacatures die bij je passen"
              icon={<Heart className="w-6 h-6" />}
            >
              <div className="space-y-3">
                {matches.slice(0, 4).map((match) => (
                  <div key={match.id} className="p-3 bg-[#faf8f5] rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-[#2c2416] text-sm">{match.vacancy_title}</p>
                        <p className="text-xs text-[#6b5d4f]">{match.company_name}</p>
                      </div>
                      <span className="text-xs font-medium text-[#8b7355]">{match.match_score}%</span>
                    </div>
                    {match.location && (
                      <div className="flex items-center gap-1 text-xs text-[#6b5d4f]">
                        <MapPin className="w-3 h-3" />
                        <span>{match.location}</span>
                      </div>
                    )}
                  </div>
                ))}
                {matches.length === 0 && <p className="text-center text-[#6b5d4f] py-4 text-sm">Nog geen matches</p>}
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Bekijk alle matches
                </Button>
              </div>
            </DashboardCard>

            {/* Berichten */}
            <DashboardCard
              title="Berichten"
              description="Communiceer met werkgevers"
              icon={<MessageSquare className="w-6 h-6" />}
            >
              <div className="space-y-3">
                {messages.slice(0, 4).map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${message.is_read ? "bg-[#faf8f5]" : "bg-[#8b7355]/10 border border-[#8b7355]/20"}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-[#2c2416] text-sm">
                        {message.sender_first_name || message.sender_email}
                      </p>
                      {!message.is_read && (
                        <span className="text-xs bg-[#8b7355] text-white px-2 py-0.5 rounded">Nieuw</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b5d4f] truncate">{message.subject || "Geen onderwerp"}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-center text-[#6b5d4f] py-4 text-sm">Nog geen berichten</p>}
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Bekijk alle berichten
                </Button>
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  )
}
