import { useEffect, useCallback, useRef, useState } from 'react'
import { usePortStore, type PortInfo } from '../stores/portStore'

interface CommandResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

interface BackendPortInfo {
  port: number
  pid: number
  process_name: string
  protocol: string
  local_address: string
  state: string
}

function mapBackendPort(port: BackendPortInfo): PortInfo {
  return {
    port: port.port,
    pid: port.pid,
    processName: port.process_name,
    protocol: port.protocol as 'tcp' | 'udp',
  }
}

// Check if running in Tauri
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function usePortScanner() {
  const {
    ports,
    isLoading,
    error,
    refreshInterval,
    setPorts,
    setLoading,
    setError,
  } = usePortStore()

  const intervalRef = useRef<number | null>(null)
  const [tauriReady, setTauriReady] = useState(false)

  // Check if Tauri is ready
  useEffect(() => {
    if (isTauri()) {
      setTauriReady(true)
    }
  }, [])

  const scanPorts = useCallback(async () => {
    if (!tauriReady) return

    setLoading(true)
    setError(null)

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const response = await invoke<CommandResponse<BackendPortInfo[]>>('scan_ports')

      if (response.success && response.data) {
        const mappedPorts = response.data.map(mapBackendPort)
        setPorts(mappedPorts)
      } else {
        setError(response.error || 'Failed to scan ports')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [tauriReady, setPorts, setLoading, setError])

  const killProcess = useCallback(async (pid: number): Promise<boolean> => {
    if (!tauriReady) return false

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const response = await invoke<CommandResponse<null>>('kill_process', { pid })

      if (response.success) {
        await scanPorts()
        return true
      } else {
        setError(response.error || 'Failed to kill process')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }, [tauriReady, scanPorts, setError])

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = window.setInterval(scanPorts, refreshInterval)
  }, [scanPorts, refreshInterval])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Initial scan and start polling when Tauri is ready
  useEffect(() => {
    if (!tauriReady) return

    scanPorts()
    startPolling()

    return () => {
      stopPolling()
    }
  }, [tauriReady, scanPorts, startPolling, stopPolling])

  // Restart polling when interval changes
  useEffect(() => {
    if (intervalRef.current && tauriReady) {
      startPolling()
    }
  }, [refreshInterval, startPolling, tauriReady])

  return {
    ports,
    isLoading: isLoading || !tauriReady,
    error,
    scanPorts,
    killProcess,
    startPolling,
    stopPolling,
  }
}
