'use client'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Theme() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null)
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.body.classList.add('dark')
      setTheme('dark')
    } else if (theme === 'light') {
      document.body.classList.remove('dark')
      setTheme('light')
    } else {
      document.body.classList.remove('dark')
      setTheme('light')
    }
  }, [])
  return (
    <div>
      {theme === 'dark' ? (
        <SunIcon
          className="h-5 w-5 cursor-pointer"
          onClick={() => {
            document.body.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setTheme('light')
          }}
        />
      ) : (
        <MoonIcon
          className="h-5 w-5 cursor-pointer"
          onClick={() => {
            document.body.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setTheme('dark')
          }}
        />
      )}
    </div>
  )
}
