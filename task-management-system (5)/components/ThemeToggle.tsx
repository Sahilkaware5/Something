"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    setIsDarkMode(savedTheme === "dark")
    document.body.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle("dark")
    localStorage.setItem("theme", isDarkMode ? "light" : "dark")
  }

  return (
    <Button variant="outline" size="icon" className="fixed bottom-4 right-4" onClick={toggleTheme}>
      {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

