import { query } from "./db"

export interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
  [key: string]: string
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const settings = await query<{ setting_key: string; setting_value: string }>(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'theme_%' OR setting_key LIKE 'color_%'",
    )

    const themeSettings: ThemeSettings = {
      primaryColor: "#8b7355",
      secondaryColor: "#d4c5b9",
      backgroundColor: "#faf8f5",
      textColor: "#2c2416",
      accentColor: "#a67c52",
    }

    settings.forEach((setting) => {
      themeSettings[setting.setting_key] = setting.setting_value
    })

    return themeSettings
  } catch (error) {
    console.error("[v0] Error loading theme settings:", error)
    return {
      primaryColor: "#8b7355",
      secondaryColor: "#d4c5b9",
      backgroundColor: "#faf8f5",
      textColor: "#2c2416",
      accentColor: "#a67c52",
    }
  }
}
