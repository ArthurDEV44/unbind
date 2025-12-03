import { useState, useEffect, useCallback } from 'react'
import {
  getKillHistory,
  addKillHistory,
  clearKillHistory,
  type KillHistoryRecord,
} from '../lib/database'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function useHistory() {
  const [history, setHistory] = useState<KillHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load history from database
  const loadHistory = useCallback(async () => {
    if (!isTauri()) return

    setIsLoading(true)
    try {
      const records = await getKillHistory()
      setHistory(records)
    } catch (error) {
      console.error('Failed to load kill history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Log a kill to history
  const logKill = useCallback(
    async (port: number, pid: number, processName: string): Promise<boolean> => {
      if (!isTauri()) return false

      try {
        await addKillHistory(port, pid, processName)
        await loadHistory() // Refresh the list
        return true
      } catch (error) {
        console.error('Failed to log kill:', error)
        return false
      }
    },
    [loadHistory]
  )

  // Clear all history
  const clearHistory = useCallback(async (): Promise<boolean> => {
    if (!isTauri()) return false

    try {
      await clearKillHistory()
      setHistory([])
      return true
    } catch (error) {
      console.error('Failed to clear history:', error)
      return false
    }
  }, [])

  return {
    history,
    isLoading,
    logKill,
    clearHistory,
    refreshHistory: loadHistory,
  }
}
