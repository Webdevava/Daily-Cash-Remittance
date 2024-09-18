'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Cookies from 'js-cookie'

export function MainHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()

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

  const handleLogout = () => {
    Cookies.remove('token')
    Cookies.remove('userId')
    router.push('/login')
  }

  return (
    <header className="bg-background border-b flex items-center justify-between px-4 h-16">
      <h1 className="text-2xl font-bold">Remittances</h1>
      <div className="flex items-center space-x-2">
        <Button onClick={toggleTheme} variant="outline" size="icon" className="text-foreground">
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will end your current session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  )
}