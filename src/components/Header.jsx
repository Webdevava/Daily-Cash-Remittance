'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Cookies from 'js-cookie'

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Effect to apply theme from cookies
  useEffect(() => {
    const theme = Cookies.get('theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []); // Run once on mount

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      document.body.classList.toggle('dark', newTheme);
      Cookies.set('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  }

  return (
    <header className="bg-background border-b flex items-center justify-between px-4 h-16">
      <h1 className="text-2xl font-bold">Remittances</h1>
      <Button onClick={toggleTheme} variant="outline" size="icon" className="text-foreground">
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  )
}