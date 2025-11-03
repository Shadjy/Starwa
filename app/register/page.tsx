"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Briefcase, UserCircle, Sparkles, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"werkgever" | "werkzoeker">("werkzoeker")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen")
      return
    }

    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 karakters bevatten")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden bij het registreren")
        setLoading(false)
        return
      }

      setRegistrationSuccess(true)

      // Try auto-login
      try {
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (loginResponse.ok) {
          // Auto-login succeeded, go to questionnaire
          router.push("/questionnaire")
        } else {
          // Auto-login failed, redirect to login page with success message
          setTimeout(() => {
            router.push("/login?message=Account succesvol aangemaakt! Log nu in om verder te gaan.")
          }, 1500)
        }
      } catch (loginError) {
        // Auto-login error, redirect to login page
        setTimeout(() => {
          router.push("/login?message=Account succesvol aangemaakt! Log nu in om verder te gaan.")
        }, 1500)
      }
    } catch (err) {
      setError("Kan geen verbinding maken met de server. Probeer het opnieuw.")
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 gradient-bg">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl border-2 border-[#d4a574] shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#9bc49f] to-[#7fb584] rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#3d2f1f] mb-3">Account aangemaakt!</h1>
            <p className="text-[#8b7355] text-lg mb-6">Je wordt doorgestuurd naar je dashboard...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4a574]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 gradient-bg">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border-2 border-[#f0dfc8] shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#d4a574] to-[#e8b86d] rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#3d2f1f] mb-2">Account aanmaken</h1>
            <p className="text-[#8b7355] text-lg text-balance">Start vandaag nog met slimme AI-matching</p>
          </div>

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
                placeholder="Minimaal 6 karakters"
                className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] focus:ring-[#d4a574] h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-[#3d2f1f] font-semibold text-base">
                Bevestig wachtwoord
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Herhaal je wachtwoord"
                className="mt-2 border-2 border-[#f0dfc8] focus:border-[#d4a574] focus:ring-[#d4a574] h-12 text-base"
              />
            </div>

            <div>
              <Label className="text-[#3d2f1f] font-semibold text-base mb-3 block">Ik ben een...</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("werkzoeker")}
                  className={`p-6 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    role === "werkzoeker"
                      ? "border-[#d4a574] bg-gradient-to-br from-[#ffeaa7] to-[#f5e6d3] shadow-lg"
                      : "border-[#f0dfc8] hover:border-[#d4a574] bg-white"
                  }`}
                >
                  <UserCircle
                    className={`w-10 h-10 mx-auto mb-3 ${role === "werkzoeker" ? "text-[#d4a574]" : "text-[#8b7355]"}`}
                  />
                  <div className="font-bold text-[#3d2f1f] text-lg">Werkzoeker</div>
                  <div className="text-sm text-[#8b7355] mt-1">Vind je droombaan</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("werkgever")}
                  className={`p-6 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    role === "werkgever"
                      ? "border-[#d4a574] bg-gradient-to-br from-[#ffeaa7] to-[#f5e6d3] shadow-lg"
                      : "border-[#f0dfc8] hover:border-[#d4a574] bg-white"
                  }`}
                >
                  <Briefcase
                    className={`w-10 h-10 mx-auto mb-3 ${role === "werkgever" ? "text-[#d4a574]" : "text-[#8b7355]"}`}
                  />
                  <div className="font-bold text-[#3d2f1f] text-lg">Werkgever</div>
                  <div className="text-sm text-[#8b7355] mt-1">Vind top talent</div>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#d4a574] to-[#e8b86d] hover:from-[#e8b86d] hover:to-[#d4a574] text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              disabled={loading}
            >
              {loading ? "Account aanmaken..." : "Registreren"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#8b7355] text-base">
              Al een account?{" "}
              <Link href="/login" className="text-[#d4a574] hover:text-[#e8b86d] font-semibold hover:underline">
                Log hier in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
