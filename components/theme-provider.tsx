"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextType {
  theme: Record<string, string>
  refreshTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  theme: {},
  refreshTheme: async () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({
  children,
  initialTheme,
}: { children: React.ReactNode; initialTheme?: Record<string, string> }) {
  const [theme, setTheme] = useState(initialTheme || {})

  const refreshTheme = async () => {
    try {
      const response = await fetch("/api/theme")
      const data = await response.json()
      setTheme(data.theme)
      applyTheme(data.theme)
    } catch (error) {
      console.error("[v0] Error refreshing theme:", error)
    }
  }

  const applyTheme = (themeData: Record<string, string>) => {
    const root = document.documentElement
    Object.entries(themeData).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }

  useEffect(() => {
    if (Object.keys(theme).length > 0) {
      applyTheme(theme)
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, refreshTheme }}>{children}</ThemeContext.Provider>
}
