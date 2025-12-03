import { useEffect, useRef, useCallback } from 'react'
import { usePortStore } from '../stores/portStore'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function useNotifications() {
  const { ports, favorites } = usePortStore()
  const previousPortsRef = useRef<Set<number>>(new Set())
  const notificationSentRef = useRef<Set<number>>(new Set())

  const sendNotification = useCallback(async (title: string, body: string) => {
    if (!isTauri()) return

    try {
      const {
        isPermissionGranted,
        requestPermission,
        sendNotification: tauriSendNotification,
      } = await import('@tauri-apps/plugin-notification')

      let permissionGranted = await isPermissionGranted()

      if (!permissionGranted) {
        const permission = await requestPermission()
        permissionGranted = permission === 'granted'
      }

      if (permissionGranted) {
        await tauriSendNotification({ title, body })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }, [])

  // Check for favorite ports that become occupied
  useEffect(() => {
    if (!isTauri()) return

    const currentPorts = new Set(ports.map((p) => p.port))
    const previousPorts = previousPortsRef.current

    // Find newly occupied ports
    const newPorts = ports.filter((p) => !previousPorts.has(p.port))

    // Check if any new port is a favorite
    for (const port of newPorts) {
      const favorite = favorites.find((f) => f.port === port.port)
      if (favorite && !notificationSentRef.current.has(port.port)) {
        sendNotification(
          `Port ${port.port} is now in use`,
          `${favorite.label} - Process: ${port.processName} (PID ${port.pid})`
        )
        notificationSentRef.current.add(port.port)
      }
    }

    // Clear notification sent flag for ports that are no longer in use
    for (const portNum of notificationSentRef.current) {
      if (!currentPorts.has(portNum)) {
        notificationSentRef.current.delete(portNum)
      }
    }

    // Update previous ports reference
    previousPortsRef.current = currentPorts
  }, [ports, favorites, sendNotification])

  return { sendNotification }
}

// Hook to initialize notifications on app start
export function useFavoritePortNotifications() {
  const { ports, favorites } = usePortStore()
  const initializedRef = useRef(false)
  const notifiedPortsRef = useRef<Set<number>>(new Set())

  const sendNotification = useCallback(async (title: string, body: string) => {
    if (!isTauri()) return

    try {
      const {
        isPermissionGranted,
        requestPermission,
        sendNotification: tauriSendNotification,
      } = await import('@tauri-apps/plugin-notification')

      let permissionGranted = await isPermissionGranted()

      if (!permissionGranted) {
        const permission = await requestPermission()
        permissionGranted = permission === 'granted'
      }

      if (permissionGranted) {
        await tauriSendNotification({ title, body })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }, [])

  // Skip initial scan, only notify on changes
  useEffect(() => {
    if (!isTauri()) return

    // After first render with ports, mark as initialized
    if (!initializedRef.current && ports.length > 0) {
      // Record all current ports as "already notified" so we don't spam on startup
      ports.forEach((p) => notifiedPortsRef.current.add(p.port))
      initializedRef.current = true
      return
    }

    if (!initializedRef.current) return

    // Find favorite ports that are newly in use
    const currentPortSet = new Set(ports.map((p) => p.port))

    // Check for new favorite ports
    for (const port of ports) {
      const favorite = favorites.find((f) => f.port === port.port)
      if (favorite && !notifiedPortsRef.current.has(port.port)) {
        sendNotification(
          `Favorite port :${port.port} is now in use`,
          `${favorite.label}\nProcess: ${port.processName} (PID ${port.pid})`
        )
        notifiedPortsRef.current.add(port.port)
      }
    }

    // Clean up ports that are no longer in use
    for (const portNum of notifiedPortsRef.current) {
      if (!currentPortSet.has(portNum)) {
        notifiedPortsRef.current.delete(portNum)
      }
    }
  }, [ports, favorites, sendNotification])
}
