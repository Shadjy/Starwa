"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QuestionStep } from "@/components/questionnaire/question-step"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface User {
  id: number
  email: string
  role: string
}

interface QuestionnaireData {
  first_name: string
  last_name: string
  phone: string
  location: string
  company_name: string
  bio: string
  experience: string
  skills: string
  availability: string
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [data, setData] = useState<QuestionnaireData>({
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    company_name: "",
    bio: "",
    experience: "",
    skills: "",
    availability: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await fetch("/api/auth/me")
        if (!userRes.ok) {
          router.push("/login")
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        // Check if questionnaire already completed
        if (userData.profile?.questionnaire_completed) {
          if (userData.user.role === "werkgever") {
            router.push("/dashboard/werkgever")
          } else {
            router.push("/dashboard/werkzoeker")
          }
          return
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching user:", error)
        router.push("/login")
      }
    }

    fetchUser()
  }, [router])

  const getQuestions = () => {
    const baseQuestions = [
      {
        key: "first_name",
        question: "Wat is je voornaam?",
        type: "text" as const,
        placeholder: "Bijv. Jan",
      },
      {
        key: "last_name",
        question: "Wat is je achternaam?",
        type: "text" as const,
        placeholder: "Bijv. Jansen",
      },
      {
        key: "phone",
        question: "Wat is je telefoonnummer?",
        type: "text" as const,
        placeholder: "Bijv. 06-12345678",
      },
      {
        key: "location",
        question: "Waar woon je?",
        description: "Stad of regio",
        type: "text" as const,
        placeholder: "Bijv. Amsterdam",
      },
    ]

    if (user?.role === "werkgever") {
      return [
        ...baseQuestions,
        {
          key: "company_name",
          question: "Wat is de naam van je bedrijf?",
          type: "text" as const,
          placeholder: "Bijv. TechBedrijf BV",
        },
        {
          key: "bio",
          question: "Vertel iets over je bedrijf",
          description: "Wat doet je bedrijf en wat maakt het uniek?",
          type: "textarea" as const,
          placeholder: "Beschrijf je bedrijf...",
        },
      ]
    } else {
      return [
        ...baseQuestions,
        {
          key: "experience",
          question: "Hoeveel werkervaring heb je?",
          type: "select" as const,
          options: ["Starter (0-2 jaar)", "Junior (2-5 jaar)", "Medior (5-10 jaar)", "Senior (10+ jaar)"],
        },
        {
          key: "skills",
          question: "Wat zijn je belangrijkste vaardigheden?",
          description: "Bijv. programmeren, marketing, design, etc.",
          type: "textarea" as const,
          placeholder: "Beschrijf je vaardigheden...",
        },
        {
          key: "availability",
          question: "Wanneer ben je beschikbaar?",
          type: "select" as const,
          options: ["Direct beschikbaar", "Binnen 1 maand", "Binnen 2-3 maanden", "Op zoek naar toekomstige kansen"],
        },
        {
          key: "bio",
          question: "Vertel iets over jezelf",
          description: "Wat maakt jou uniek als kandidaat?",
          type: "textarea" as const,
          placeholder: "Beschrijf jezelf...",
        },
      ]
    }
  }

  const questions = getQuestions()
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // Update profile
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          questionnaire_completed: true,
        }),
      })

      // Save questionnaire responses
      await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: data }),
      })

      // Redirect to dashboard
      if (user?.role === "werkgever") {
        router.push("/dashboard/werkgever")
      } else {
        router.push("/dashboard/werkzoeker")
      }
    } catch (error) {
      console.error("[v0] Error submitting questionnaire:", error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-[#6b5d4f]">Laden...</div>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed = data[currentQuestion.key as keyof QuestionnaireData]

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2c2416] mb-2">Voltooi je profiel</h1>
          <p className="text-[#6b5d4f]">
            Stap {currentStep + 1} van {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-lg border border-[#e5ddd5] shadow-sm mb-6">
          <QuestionStep
            question={currentQuestion.question}
            description={currentQuestion.description}
            type={currentQuestion.type}
            value={data[currentQuestion.key as keyof QuestionnaireData]}
            onChange={(value) => setData({ ...data, [currentQuestion.key]: value })}
            options={currentQuestion.options}
            placeholder={currentQuestion.placeholder}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="bg-white">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Vorige
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || submitting}
              className="bg-[#8b7355] hover:bg-[#6b5d4f] text-white"
            >
              {submitting ? (
                "Opslaan..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Voltooien
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed} className="bg-[#8b7355] hover:bg-[#6b5d4f] text-white">
              Volgende
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button onClick={handleSubmit} className="text-sm text-[#6b5d4f] hover:text-[#8b7355] underline">
            Overslaan en later invullen
          </button>
        </div>
      </div>
    </div>
  )
}
