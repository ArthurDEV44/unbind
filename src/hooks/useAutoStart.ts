import { useEffect, useCallback } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function useAutoStart() {
  const { autoStart, setAutoStart } = useSettingsStore()

  // Sync with system auto-start state on mount
  useEffect(() => {
    if (!isTauri()) return

    const syncAutoStart = async () => {
      try {
        const { isEnabled } = await import('@tauri-apps/plugin-autostart')
        const enabled = await isEnabled()
        if (enabled !== autoStart) {
          setAutoStart(enabled)
        }
      } catch (error) {
        console.error('Failed to check auto-start status:', error)
      }
    }

    syncAutoStart()
  }, [autoStart, setAutoStart])

  const enableAutoStart = useCallback(async (): Promise<boolean> => {
    if (!isTauri()) return false

    try {
      const { enable } = await import('@tauri-apps/plugin-autostart')
      await enable()
      setAutoStart(true)
      return true
    } catch (error) {
      console.error('Failed to enable auto-start:', error)
      return false
    }
  }, [setAutoStart])

  const disableAutoStart = useCallback(async (): Promise<boolean> => {
    if (!isTauri()) return false

    try {
      const { disable } = await import('@tauri-apps/plugin-autostart')
      await disable()
      setAutoStart(false)
      return true
    } catch (error) {
      console.error('Failed to disable auto-start:', error)
      return false
    }
  }, [setAutoStart])

  const toggleAutoStart = useCallback(async (): Promise<boolean> => {
    if (autoStart) {
      return disableAutoStart()
    } else {
      return enableAutoStart()
    }
  }, [autoStart, enableAutoStart, disableAutoStart])

  return {
    autoStart,
    enableAutoStart,
    disableAutoStart,
    toggleAutoStart,
  }
}
