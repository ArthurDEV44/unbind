import { useState, useCallback } from 'react'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export interface UpdateInfo {
  version: string
  currentVersion: string
  body?: string
}

export function useUpdater() {
  const [checking, setChecking] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkForUpdates = useCallback(async (): Promise<UpdateInfo | null> => {
    if (!isTauri()) return null

    setChecking(true)
    setError(null)

    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const { getVersion } = await import('@tauri-apps/api/app')

      const update = await check()
      const currentVersion = await getVersion()

      if (update) {
        const info: UpdateInfo = {
          version: update.version,
          currentVersion,
          body: update.body ?? undefined,
        }
        setUpdateAvailable(info)
        return info
      }

      setUpdateAvailable(null)
      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check for updates'
      setError(message)
      return null
    } finally {
      setChecking(false)
    }
  }, [])

  const installUpdate = useCallback(async (): Promise<boolean> => {
    if (!isTauri() || !updateAvailable) return false

    setUpdating(true)
    setError(null)

    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const { relaunch } = await import('@tauri-apps/plugin-process')

      const update = await check()
      if (update) {
        await update.downloadAndInstall()
        await relaunch()
        return true
      }
      return false
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to install update'
      setError(message)
      return false
    } finally {
      setUpdating(false)
    }
  }, [updateAvailable])

  return {
    checking,
    updating,
    updateAvailable,
    error,
    checkForUpdates,
    installUpdate,
  }
}
