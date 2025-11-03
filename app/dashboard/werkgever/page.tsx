"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Briefcase, Plus, TrendingUp, Sparkles, Star, Eye, Settings } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  role: string
}

interface Vacancy {
  id: number
  title: string
  status: string
  created_at: string
}

interface Match {
  id: number
  vacancy_title: string
  first_name: string
  last_name: string
  match_score: number
  status: string
}

interface Message {
  id: number
  subject: string
  sender_email: string
  is_read: boolean
  created_at: string
}

export default function EmployerDashboard() {
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

        // Fetch vacancies
        const vacanciesRes = await fetch("/api/vacancies")
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

  const activeVacancies = vacancies.filter((v) => v.status === "active").length
  const unreadMessages = messages.filter((m) => !m.is_read && m.sender_email !== user?.email).length
  const pendingMatches = matches.filter((m) => m.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbf5] via-[#ffeaa7]/20 to-[#f5e6d3]/30">
      <DashboardHeader title="Werkgever Dashboard" userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-[#d4a574] to-[#e8b86d] p-8 rounded-2xl shadow-xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-4xl font-bold">Welkom terug!</h2>
          </div>
          <p className="text-xl text-white/90">Hier is een overzicht van je recruitment activiteiten</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Actieve Vacatures</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{activeVacancies}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Nieuwe Matches</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{pendingMatches}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#9bc49f] to-[#7fb584] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-white" />
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
                <p className="text-sm text-[#8b7355] mb-2 font-medium">Totaal Kandidaten</p>
                <p className="text-4xl font-bold text-[#3d2f1f]">{matches.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#d4a574] to-[#a67c52] rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/dashboard/werkgever/vacatures/nieuw">
            <Button className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Nieuwe Vacature
            </Button>
          </Link>
          <Link href="/dashboard/werkgever/kandidaten">
            <Button
              variant="outline"
              className="w-full border-2 border-[#d4a574] text-[#d4a574] hover:bg-[#f5e6d3] font-bold py-6 bg-transparent"
            >
              <Users className="w-5 h-5 mr-2" />
              Bekijk Kandidaten
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
          {/* Kandidaten / Matches */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9bc49f] to-[#7fb584] rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#3d2f1f]">Recente Matches</h3>
                <p className="text-sm text-[#8b7355]">Nieuwe kandidaten voor je vacatures</p>
              </div>
            </div>
            <div className="space-y-3">
              {matches.slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  className="p-4 bg-gradient-to-br from-[#fffbf5] to-[#ffeaa7]/20 rounded-xl border border-[#f0dfc8] card-hover"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-[#3d2f1f]">
                        {match.first_name} {match.last_name}
                      </p>
                      <p className="text-sm text-[#8b7355]">{match.vacancy_title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#e8b86d] fill-[#e8b86d]" />
                      <span className="text-sm font-bold text-[#d4a574]">{match.match_score}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-[#d4a574] hover:bg-[#e8b86d] text-white">
                      <Eye className="w-4 h-4 mr-1" />
                      Bekijk
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#d4a574] text-[#d4a574] bg-transparent"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
              {matches.length === 0 && <p className="text-center text-[#8b7355] py-8">Nog geen matches beschikbaar</p>}
            </div>
          </div>

          {/* Berichten */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e8b86d] to-[#f4c97d] rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#3d2f1f]">Berichten</h3>
                <p className="text-sm text-[#8b7355]">Communiceer met kandidaten</p>
              </div>
            </div>
            <div className="space-y-3">
              {messages.slice(0, 5).map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-xl border transition-all card-hover ${
                    message.is_read
                      ? "bg-[#fffbf5] border-[#f0dfc8]"
                      : "bg-gradient-to-br from-[#ffeaa7] to-[#f5e6d3] border-[#d4a574] shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-[#3d2f1f] text-sm">{message.sender_email}</p>
                    {!message.is_read && (
                      <span className="text-xs bg-gradient-to-r from-[#d4a574] to-[#e8b86d] text-white px-3 py-1 rounded-full font-bold shadow-sm">
                        Nieuw
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#8b7355] truncate">{message.subject || "Geen onderwerp"}</p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-[#8b7355] py-8">Nog geen berichten</p>}
            </div>
          </div>

          {/* Vacatures */}
          <div className="bg-white p-6 rounded-2xl border-2 border-[#f0dfc8] shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#3d2f1f]">Mijn Vacatures</h3>
                <p className="text-sm text-[#8b7355]">Beheer je openstaande vacatures</p>
              </div>
            </div>
            <div className="space-y-3">
              {vacancies.slice(0, 5).map((vacancy) => (
                <div
                  key={vacancy.id}
                  className="p-4 bg-gradient-to-br from-[#fffbf5] to-[#ffeaa7]/20 rounded-xl border border-[#f0dfc8] card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-[#3d2f1f]">{vacancy.title}</p>
                      <p className="text-xs text-[#8b7355] mt-1">
                        {new Date(vacancy.created_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        vacancy.status === "active"
                          ? "bg-gradient-to-r from-[#9bc49f] to-[#7fb584] text-white shadow-sm"
                          : vacancy.status === "draft"
                            ? "bg-gradient-to-r from-[#f4c97d] to-[#e8b86d] text-white shadow-sm"
                            : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {vacancy.status === "active" ? "Actief" : vacancy.status === "draft" ? "Concept" : "Gesloten"}
                    </span>
                  </div>
                </div>
              ))}
              {vacancies.length === 0 && (
                <p className="text-center text-[#8b7355] py-8">Nog geen vacatures aangemaakt</p>
              )}
              <Link href="/dashboard/werkgever/vacatures/nieuw">
                <Button className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe vacature
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
