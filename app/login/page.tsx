"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden")
        setLoading(false)
        return
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin")
      } else if (data.user.role === "werkgever") {
        router.push("/dashboard/werkgever")
      } else {
        router.push("/dashboard/werkzoeker")
      }
    } catch (err) {
      setError("Er is een fout opgetreden bij het inloggen")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 gradient-bg">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border-2 border-[#f0dfc8] shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#3d2f1f] mb-2">Welkom terug</h1>
            <p className="text-[#8b7355] text-lg text-balance">Log in op je TalentMatch account</p>
          </div>

          {successMessage && (
            <Alert className="mb-6 bg-[#9bc49f]/10 border-2 border-[#9bc49f] text-[#3d2f1f]">{successMessage}</Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6 border-2">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-[#3d2f1f] font-semibold text-base">
                E-mailadres
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jouw@email.nl"
                className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] focus:ring-[#d4a574] h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#3d2f1f] font-semibold text-base">
                Wachtwoord
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] focus:ring-[#d4a574] h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              disabled={loading}
            >
              {loading ? "Bezig met inloggen..." : "Inloggen"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#8b7355] text-base">
              Nog geen account?{" "}
              <Link href="/register" className="text-[#d4a574] hover:text-[#e8b86d] font-semibold hover:underline">
                Registreer hier
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
