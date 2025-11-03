"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCard } from "@/components/dashboard-card"
import { ColorPicker } from "@/components/admin/color-picker"
import { SettingToggle } from "@/components/admin/setting-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert } from "@/components/ui/alert"
import { Palette, Layout, Type, Settings, Save, RefreshCw } from "lucide-react"

interface User {
  id: number
  email: string
  role: string
}

interface AppSettings {
  primary_color: string
  secondary_color: string
  background_color: string
  text_color: string
  accent_color: string
  dashboard_layout: string
  sidebar_position: string
  site_title: string
  welcome_message: string
  show_matches: string
  show_messages: string
  show_vacancies: string
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
    primary_color: "#D4C5B9",
    secondary_color: "#8B7355",
    background_color: "#FAF8F5",
    text_color: "#2C2416",
    accent_color: "#A67C52",
    dashboard_layout: "grid",
    sidebar_position: "left",
    site_title: "TalentMatch",
    welcome_message: "Welkom bij TalentMatch",
    show_matches: "true",
    show_messages: "true",
    show_vacancies: "true",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

        if (userData.user.role !== "admin") {
          router.push("/dashboard")
          return
        }

        setUser(userData.user)

        // Fetch settings
        const settingsRes = await fetch("/api/settings")
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings((prev) => ({ ...prev, ...settingsData.settings }))
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching admin data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/settings/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setMessage({ type: "success", text: "Instellingen succesvol opgeslagen!" })

      // Apply theme changes to CSS variables
      applyThemeChanges()
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      setMessage({ type: "error", text: "Fout bij opslaan instellingen" })
    } finally {
      setSaving(false)
    }
  }

  const applyThemeChanges = () => {
    const root = document.documentElement
    root.style.setProperty("--color-primary", settings.primary_color)
    root.style.setProperty("--color-primary-dark", settings.secondary_color)
    root.style.setProperty("--color-secondary", settings.accent_color)
    root.style.setProperty("--color-background", settings.background_color)
    root.style.setProperty("--color-text", settings.text_color)
  }

  const handleResetToDefaults = () => {
    setSettings({
      primary_color: "#D4C5B9",
      secondary_color: "#8B7355",
      background_color: "#FAF8F5",
      text_color: "#2C2416",
      accent_color: "#A67C52",
      dashboard_layout: "grid",
      sidebar_position: "left",
      site_title: "TalentMatch",
      welcome_message: "Welkom bij TalentMatch",
      show_matches: "true",
      show_messages: "true",
      show_vacancies: "true",
    })
    setMessage({ type: "success", text: "Instellingen gereset naar standaardwaarden" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-[#6b5d4f]">Laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader title="Admin Customization" userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#2c2416] mb-2">Aanpassingen Beheren</h2>
            <p className="text-[#6b5d4f]">Pas het uiterlijk en de functionaliteit van de applicatie aan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetToDefaults}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-[#8b7355] hover:bg-[#6b5d4f] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
            {message.text}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="bg-white border border-[#e5ddd5]">
            <TabsTrigger value="theme" className="data-[state=active]:bg-[#8b7355] data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Thema & Kleuren
            </TabsTrigger>
            <TabsTrigger value="layout" className="data-[state=active]:bg-[#8b7355] data-[state=active]:text-white">
              <Layout className="w-4 h-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-[#8b7355] data-[state=active]:text-white">
              <Type className="w-4 h-4 mr-2" />
              Teksten
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-[#8b7355] data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Functies
            </TabsTrigger>
          </TabsList>

          {/* Theme & Colors Tab */}
          <TabsContent value="theme">
            <DashboardCard title="Kleurenschema" description="Pas de kleuren van de applicatie aan">
              <div className="grid md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Primaire Kleur"
                  value={settings.primary_color}
                  onChange={(value) => setSettings({ ...settings, primary_color: value })}
                />
                <ColorPicker
                  label="Secundaire Kleur"
                  value={settings.secondary_color}
                  onChange={(value) => setSettings({ ...settings, secondary_color: value })}
                />
                <ColorPicker
                  label="Achtergrondkleur"
                  value={settings.background_color}
                  onChange={(value) => setSettings({ ...settings, background_color: value })}
                />
                <ColorPicker
                  label="Tekstkleur"
                  value={settings.text_color}
                  onChange={(value) => setSettings({ ...settings, text_color: value })}
                />
                <ColorPicker
                  label="Accentkleur"
                  value={settings.accent_color}
                  onChange={(value) => setSettings({ ...settings, accent_color: value })}
                />
              </div>

              {/* Preview */}
              <div
                className="mt-6 p-6 rounded-lg border-2 border-[#e5ddd5]"
                style={{ backgroundColor: settings.background_color }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: settings.text_color }}>
                  Voorbeeld
                </h3>
                <p className="mb-4" style={{ color: settings.text_color, opacity: 0.7 }}>
                  Dit is hoe je kleuren eruit zien in de applicatie
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: settings.secondary_color }}
                  >
                    Primaire Knop
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: settings.accent_color }}
                  >
                    Accent Knop
                  </button>
                </div>
              </div>
            </DashboardCard>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout">
            <DashboardCard title="Layout Instellingen" description="Pas de layout van dashboards aan">
              <div className="space-y-4">
                <div>
                  <Label>Dashboard Layout</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={() => setSettings({ ...settings, dashboard_layout: "grid" })}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        settings.dashboard_layout === "grid"
                          ? "border-[#8b7355] bg-[#8b7355]/5"
                          : "border-[#e5ddd5] hover:border-[#d4c5b9]"
                      }`}
                    >
                      <div className="font-semibold text-[#2c2416]">Grid Layout</div>
                      <div className="text-sm text-[#6b5d4f]">Kaarten in raster</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, dashboard_layout: "list" })}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        settings.dashboard_layout === "list"
                          ? "border-[#8b7355] bg-[#8b7355]/5"
                          : "border-[#e5ddd5] hover:border-[#d4c5b9]"
                      }`}
                    >
                      <div className="font-semibold text-[#2c2416]">Lijst Layout</div>
                      <div className="text-sm text-[#6b5d4f]">Verticale lijst</div>
                    </button>
                  </div>
                </div>

                <div>
                  <Label>Sidebar Positie</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={() => setSettings({ ...settings, sidebar_position: "left" })}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        settings.sidebar_position === "left"
                          ? "border-[#8b7355] bg-[#8b7355]/5"
                          : "border-[#e5ddd5] hover:border-[#d4c5b9]"
                      }`}
                    >
                      <div className="font-semibold text-[#2c2416]">Links</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, sidebar_position: "right" })}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        settings.sidebar_position === "right"
                          ? "border-[#8b7355] bg-[#8b7355]/5"
                          : "border-[#e5ddd5] hover:border-[#d4c5b9]"
                      }`}
                    >
                      <div className="font-semibold text-[#2c2416]">Rechts</div>
                    </button>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <DashboardCard title="Teksten Aanpassen" description="Wijzig de teksten in de applicatie">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site_title">Site Titel</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title}
                    onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                    placeholder="TalentMatch"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="welcome_message">Welkomstbericht</Label>
                  <Input
                    id="welcome_message"
                    value={settings.welcome_message}
                    onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                    placeholder="Welkom bij TalentMatch"
                    className="mt-1"
                  />
                </div>
              </div>
            </DashboardCard>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <DashboardCard title="Dashboard Functies" description="Schakel dashboard componenten in of uit">
              <div className="space-y-3">
                <SettingToggle
                  label="Toon Matches Sectie"
                  description="Toon de matches/kandidaten sectie op dashboards"
                  checked={settings.show_matches === "true"}
                  onChange={(checked) => setSettings({ ...settings, show_matches: checked ? "true" : "false" })}
                />
                <SettingToggle
                  label="Toon Berichten Sectie"
                  description="Toon de berichten sectie op dashboards"
                  checked={settings.show_messages === "true"}
                  onChange={(checked) => setSettings({ ...settings, show_messages: checked ? "true" : "false" })}
                />
                <SettingToggle
                  label="Toon Vacatures Sectie"
                  description="Toon de vacatures sectie op dashboards"
                  checked={settings.show_vacancies === "true"}
                  onChange={(checked) => setSettings({ ...settings, show_vacancies: checked ? "true" : "false" })}
                />
              </div>
            </DashboardCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
