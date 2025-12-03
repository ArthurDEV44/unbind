import { useState } from 'react'
import { usePortScanner } from '../hooks/usePortScanner'
import { usePortStore, type PortInfo } from '../stores/portStore'

interface PortItemProps {
  port: PortInfo
  onKill: (pid: number) => Promise<boolean>
  favoriteLabel?: string
}

function PortItem({ port, onKill, favoriteLabel }: PortItemProps) {
  const [isKilling, setIsKilling] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleKill = async () => {
    setIsKilling(true)
    await onKill(port.pid)
    setIsKilling(false)
  }

  return (
    <div
      className="group relative flex items-center justify-between px-4 py-3 transition-all duration-200 cursor-default"
      style={{
        background: isHovered ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border-light)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Port info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Port badge */}
        <div
          className="flex items-center justify-center min-w-[72px] px-3 py-1.5 rounded-lg font-mono text-sm font-semibold"
          style={{
            background: 'var(--accent)',
            color: '#ffffff',
          }}
        >
          :{port.port}
        </div>

        {/* Process info */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-medium text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {port.processName}
            </span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
              }}
            >
              {port.protocol}
            </span>
          </div>
          <span
            className="text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            PID {port.pid}
            {favoriteLabel && (
              <span style={{ color: 'var(--accent)' }}> · {favoriteLabel}</span>
            )}
          </span>
        </div>
      </div>

      {/* Kill button */}
      <button
        onClick={handleKill}
        disabled={isKilling}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isHovered ? 'var(--danger)' : 'var(--bg-tertiary)',
          color: isHovered ? '#ffffff' : 'var(--text-secondary)',
          opacity: isKilling ? 0.5 : 1,
        }}
      >
        {isKilling ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{isKilling ? 'Killing' : 'Kill'}</span>
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        No listening ports found
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        All clear! Your ports are free.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-12 h-12 mb-4">
        <div
          className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        Scanning ports...
      </p>
    </div>
  )
}

export function PortList() {
  const { ports, isLoading, error, scanPorts, killProcess } = usePortScanner()
  const { favorites } = usePortStore()

  const getFavoriteLabel = (port: number): string | undefined => {
    return favorites.find((f) => f.port === port)?.label
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Listening Ports
          </h2>
          {ports.length > 0 && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
              }}
            >
              {ports.length}
            </span>
          )}
        </div>
        <button
          onClick={() => scanPorts()}
          disabled={isLoading}
          className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 text-sm"
          style={{
            background: 'rgba(255, 59, 48, 0.1)',
            color: 'var(--danger)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Port list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && ports.length === 0 ? (
          <LoadingState />
        ) : ports.length === 0 ? (
          <EmptyState />
        ) : (
          ports.map((port) => (
            <PortItem
              key={`${port.port}-${port.pid}`}
              port={port}
              onKill={killProcess}
              favoriteLabel={getFavoriteLabel(port.port)}
            />
          ))
        )}
      </div>
    </div>
  )
}
