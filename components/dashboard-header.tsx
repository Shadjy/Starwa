"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  userEmail?: string
}

export function DashboardHeader({ title, userEmail }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <header className="border-b border-[#e5ddd5] bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2c2416]">{title}</h1>
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="flex items-center gap-2 text-[#6b5d4f]">
              <User className="w-4 h-4" />
              <span className="text-sm">{userEmail}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[#6b5d4f]">
            <LogOut className="w-4 h-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>
    </header>
  )
}
