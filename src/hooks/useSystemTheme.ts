import { useEffect } from 'react'
import { useThemeStore, type Theme } from '../stores/themeStore'
import { useSettingsStore } from '../stores/settingsStore'

export function useSystemTheme() {
  const { setTheme } = useThemeStore()
  const { useSystemTheme: followSystem } = useSettingsStore()

  useEffect(() => {
    if (!followSystem) return

    // Check current system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = (isDark: boolean) => {
      const systemTheme: Theme = isDark ? 'dark' : 'light'
      setTheme(systemTheme)
    }

    // Set initial theme based on system
    updateTheme(mediaQuery.matches)

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      updateTheme(e.matches)
    }

    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [followSystem, setTheme])
}
