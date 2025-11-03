"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface QuestionStepProps {
  question: string
  description?: string
  type: "text" | "textarea" | "select"
  value: string
  onChange: (value: string) => void
  options?: string[]
  placeholder?: string
}

export function QuestionStep({
  question,
  description,
  type,
  value,
  onChange,
  options,
  placeholder,
}: QuestionStepProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-lg font-semibold text-[#2c2416]">{question}</Label>
        {description && <p className="text-sm text-[#6b5d4f] mt-1">{description}</p>}
      </div>

      {type === "text" && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-base"
        />
      )}

      {type === "textarea" && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="text-base"
        />
      )}

      {type === "select" && options && (
        <div className="grid grid-cols-1 gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                value === option ? "border-[#8b7355] bg-[#8b7355]/5" : "border-[#e5ddd5] hover:border-[#d4c5b9]"
              }`}
            >
              <span className="font-medium text-[#2c2416]">{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
