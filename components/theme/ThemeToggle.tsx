'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
      className={[
        'relative p-2 rounded-xl transition-all duration-200 group',
        'border',
        theme === 'dark'
          ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300'
          : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900',
      ].join(' ')}
    >
      {/* Sun icon — visible in dark mode */}
      <Sun
        className={[
          'h-4 w-4 absolute inset-0 m-auto transition-all duration-300',
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-50',
        ].join(' ')}
      />
      {/* Moon icon — visible in light mode */}
      <Moon
        className={[
          'h-4 w-4 transition-all duration-300',
          theme === 'dark'
            ? 'opacity-0 -rotate-90 scale-50'
            : 'opacity-100 rotate-0 scale-100',
        ].join(' ')}
      />
    </button>
  )
}
