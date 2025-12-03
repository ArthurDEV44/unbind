import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePortStore } from '../stores/portStore'

// Mock invoke at module level
const mockInvoke = vi.fn()

// Mock the Tauri API module
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}))

// Mock the database
vi.mock('../lib/database', () => ({
  addKillHistory: vi.fn().mockResolvedValue(undefined),
}))

// Import hook after mocks
import { usePortScanner } from './usePortScanner'

describe('usePortScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })

    // Reset store state
    usePortStore.setState({
      ports: [],
      isLoading: false,
      error: null,
      refreshInterval: 2000,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('scanPorts', () => {
    it('should scan ports and update the store on success', async () => {
      const mockPorts = [
        {
          port: 3000,
          pid: 1234,
          process_name: 'node',
          protocol: 'tcp',
          local_address: '0.0.0.0',
          state: 'LISTEN',
        },
        {
          port: 8080,
          pid: 5678,
          process_name: 'java',
          protocol: 'tcp',
          local_address: '127.0.0.1',
          state: 'LISTEN',
        },
      ]

      mockInvoke.mockResolvedValue({
        success: true,
        data: mockPorts,
        error: null,
      })

      const { result } = renderHook(() => usePortScanner())

      // Advance timers to allow useEffect to run
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(result.current.ports.length).toBe(2)
        },
        { timeout: 1000 }
      )

      expect(result.current.ports[0]).toEqual({
        port: 3000,
        pid: 1234,
        processName: 'node',
        protocol: 'tcp',
      })

      expect(result.current.ports[1]).toEqual({
        port: 8080,
        pid: 5678,
        processName: 'java',
        protocol: 'tcp',
      })

      expect(mockInvoke).toHaveBeenCalledWith('scan_ports')
    })

    it('should set error on scan failure', async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        data: null,
        error: 'Permission denied',
      })

      const { result } = renderHook(() => usePortScanner())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(result.current.error).toBe('Permission denied')
        },
        { timeout: 1000 }
      )
    })

    it('should handle exceptions gracefully', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => usePortScanner())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(result.current.error).toBe('Network error')
        },
        { timeout: 1000 }
      )
    })
  })

  describe('killProcess', () => {
    it('should kill a process and rescan ports on success', async () => {
      const mockPorts = [
        {
          port: 3000,
          pid: 1234,
          process_name: 'node',
          protocol: 'tcp',
          local_address: '0.0.0.0',
          state: 'LISTEN',
        },
      ]

      mockInvoke
        .mockResolvedValueOnce({ success: true, data: mockPorts, error: null }) // Initial scan
        .mockResolvedValueOnce({ success: true, data: null, error: null }) // Kill process
        .mockResolvedValueOnce({ success: true, data: [], error: null }) // Rescan after kill

      const { result } = renderHook(() => usePortScanner())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(result.current.ports.length).toBe(1)
        },
        { timeout: 1000 }
      )

      let killResult: boolean = false
      await act(async () => {
        killResult = await result.current.killProcess(1234, {
          port: 3000,
          processName: 'node',
        })
      })

      expect(killResult).toBe(true)
      expect(mockInvoke).toHaveBeenCalledWith('kill_process', { pid: 1234 })

      await waitFor(
        () => {
          expect(result.current.ports.length).toBe(0)
        },
        { timeout: 1000 }
      )
    })

    it('should return false and set error on kill failure', async () => {
      const mockPorts = [
        {
          port: 3000,
          pid: 1234,
          process_name: 'node',
          protocol: 'tcp',
          local_address: '0.0.0.0',
          state: 'LISTEN',
        },
      ]

      mockInvoke
        .mockResolvedValueOnce({ success: true, data: mockPorts, error: null })
        .mockResolvedValueOnce({
          success: false,
          data: null,
          error: 'Access denied',
        })

      const { result } = renderHook(() => usePortScanner())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(result.current.ports.length).toBe(1)
        },
        { timeout: 1000 }
      )

      let killResult: boolean = true
      await act(async () => {
        killResult = await result.current.killProcess(1234)
      })

      expect(killResult).toBe(false)
      expect(result.current.error).toBe('Access denied')
    })
  })

  describe('polling', () => {
    it('should poll at the configured interval', async () => {
      const mockPorts = [
        {
          port: 3000,
          pid: 1234,
          process_name: 'node',
          protocol: 'tcp',
          local_address: '0.0.0.0',
          state: 'LISTEN',
        },
      ]

      mockInvoke.mockResolvedValue({
        success: true,
        data: mockPorts,
        error: null,
      })

      renderHook(() => usePortScanner())

      // Initial scan
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(mockInvoke).toHaveBeenCalledTimes(1)
        },
        { timeout: 1000 }
      )

      // Advance timers by refresh interval (2000ms)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000)
      })

      await waitFor(
        () => {
          expect(mockInvoke).toHaveBeenCalledTimes(2)
        },
        { timeout: 1000 }
      )

      // Advance again
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000)
      })

      await waitFor(
        () => {
          expect(mockInvoke).toHaveBeenCalledTimes(3)
        },
        { timeout: 1000 }
      )
    })

    it('should stop polling when stopPolling is called', async () => {
      const mockPorts = [
        {
          port: 3000,
          pid: 1234,
          process_name: 'node',
          protocol: 'tcp',
          local_address: '0.0.0.0',
          state: 'LISTEN',
        },
      ]

      mockInvoke.mockResolvedValue({
        success: true,
        data: mockPorts,
        error: null,
      })

      const { result } = renderHook(() => usePortScanner())

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })

      await waitFor(
        () => {
          expect(mockInvoke).toHaveBeenCalledTimes(1)
        },
        { timeout: 1000 }
      )

      act(() => {
        result.current.stopPolling()
      })

      // Advance timers - should not trigger more scans
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000)
      })

      // Should still be 1 (no additional calls after stopping)
      expect(mockInvoke).toHaveBeenCalledTimes(1)
    })
  })
})
