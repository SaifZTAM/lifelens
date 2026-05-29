"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { PremiumToggle } from "@/components/ui/bouncy-toggle"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-8 w-14" />

  return (
    <PremiumToggle
      defaultChecked={theme === "light"}
      onChange={(checked) => setTheme(checked ? "light" : "dark")}
    />
  )
}
