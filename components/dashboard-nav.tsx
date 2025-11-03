"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Briefcase, MessageSquare, Users, Settings, LogOut, Heart, FileText, LayoutDashboard } from "lucide-react"

interface DashboardNavProps {
  role: "werkgever" | "werkzoeker" | "admin"
  userEmail?: string
}

export function DashboardNav({ role, userEmail }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const navItems = {
    werkgever: [
      { href: "/dashboard/werkgever", label: "Dashboard", icon: Home },
      { href: "/dashboard/werkgever/vacatures", label: "Vacatures", icon: Briefcase },
      { href: "/dashboard/werkgever/kandidaten", label: "Kandidaten", icon: Users },
      { href: "/dashboard/werkgever/berichten", label: "Berichten", icon: MessageSquare },
      { href: "/dashboard/werkgever/profiel", label: "Profiel", icon: FileText },
      { href: "/dashboard/werkgever/instellingen", label: "Instellingen", icon: Settings },
    ],
    werkzoeker: [
      { href: "/dashboard/werkzoeker", label: "Dashboard", icon: Home },
      { href: "/dashboard/werkzoeker/vacatures", label: "Vacatures", icon: Briefcase },
      { href: "/dashboard/werkzoeker/favorieten", label: "Favorieten", icon: Heart },
      { href: "/dashboard/werkzoeker/berichten", label: "Berichten", icon: MessageSquare },
      { href: "/dashboard/werkzoeker/profiel", label: "Profiel", icon: FileText },
      { href: "/dashboard/werkzoeker/instellingen", label: "Instellingen", icon: Settings },
    ],
    admin: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/gebruikers", label: "Gebruikers", icon: Users },
      { href: "/admin/vacatures", label: "Vacatures", icon: Briefcase },
      { href: "/admin/berichten", label: "Berichten", icon: MessageSquare },
      { href: "/admin/instellingen", label: "Instellingen", icon: Settings },
    ],
  }

  const items = navItems[role] || []

  return (
    <nav className="w-64 min-h-screen bg-gradient-to-b from-white to-[#faf8f5] border-r border-[#e5ddd5] flex flex-col">
      <div className="p-6 border-b border-[#e5ddd5]">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8b7355] to-[#a67c52] bg-clip-text text-transparent">
          MatchPlatform
        </h2>
        {userEmail && <p className="text-sm text-[#6b5d4f] mt-1">{userEmail}</p>}
      </div>

      <div className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive
                    ? "bg-gradient-to-r from-[#8b7355] to-[#a67c52] text-white hover:from-[#6b5d4f] hover:to-[#8b7355]"
                    : "text-[#6b5d4f] hover:bg-[#f5f1eb]"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-[#e5ddd5]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-[#6b5d4f] hover:bg-[#f5f1eb]"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Uitloggen
        </Button>
      </div>
    </nav>
  )
}
