"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface SettingToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#faf8f5] rounded-lg border border-[#e5ddd5]">
      <div className="flex-1">
        <Label className="text-[#2c2416]">{label}</Label>
        {description && <p className="text-sm text-[#6b5d4f] mt-1">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
