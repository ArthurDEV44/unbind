import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useAutoStart } from '../hooks/useAutoStart'
import { useUpdater } from '../hooks/useUpdater'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="relative w-10 h-6 rounded-full transition-colors duration-200 disabled:opacity-50"
      style={{
        background: enabled ? 'var(--accent)' : 'var(--bg-tertiary)',
      }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{
          transform: enabled ? 'translateX(20px)' : 'translateX(4px)',
        }}
      />
    </button>
  )
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { filter, setFilter, resetFilter, useSystemTheme, setUseSystemTheme } =
    useSettingsStore()
  const { autoStart, toggleAutoStart } = useAutoStart()
  const { checking, updating, updateAvailable, checkForUpdates, installUpdate } =
    useUpdater()
  const [isToggling, setIsToggling] = useState(false)
  const [appVersion, setAppVersion] = useState('0.1.0')

  // Get app version on mount
  useEffect(() => {
    const getVersion = async () => {
      try {
        const { getVersion } = await import('@tauri-apps/api/app')
        const version = await getVersion()
        setAppVersion(version)
      } catch {
        // Fallback to default version
      }
    }
    getVersion()
  }, [])

  const handleAutoStartToggle = async () => {
    setIsToggling(true)
    await toggleAutoStart()
    setIsToggling(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-[340px] max-h-[80vh] flex flex-col shadow-xl overflow-hidden"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--text-secondary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Filters Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Filters
              </h4>
              {(filter.minPort !== null ||
                filter.maxPort !== null ||
                filter.processName) && (
                <button
                  onClick={resetFilter}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    color: 'var(--danger)',
                    background: 'rgba(255, 59, 48, 0.1)',
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Port Range */}
            <div className="mb-3">
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Port Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filter.minPort ?? ''}
                  onChange={(e) =>
                    setFilter({
                      minPort: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  min={1}
                  max={65535}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  to
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filter.maxPort ?? ''}
                  onChange={(e) =>
                    setFilter({
                      maxPort: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  min={1}
                  max={65535}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Process Name Filter */}
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Process Name
              </label>
              <input
                type="text"
                placeholder="Filter by process name..."
                value={filter.processName}
                onChange={(e) => setFilter({ processName: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h4
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Appearance
            </h4>

            <div
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border-light)' }}
            >
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Follow System Theme
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Automatically switch between light and dark
                </p>
              </div>
              <Toggle
                enabled={useSystemTheme}
                onChange={() => setUseSystemTheme(!useSystemTheme)}
              />
            </div>
          </section>

          {/* Startup Section */}
          <section>
            <h4
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Startup
            </h4>

            <div className="flex items-center justify-between py-2">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Launch at Login
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Start Unbind when you log in
                </p>
              </div>
              <Toggle
                enabled={autoStart}
                onChange={handleAutoStartToggle}
                disabled={isToggling}
              />
            </div>
          </section>

          {/* Keyboard Shortcuts Section */}
          <section>
            <h4
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Keyboard Shortcuts
            </h4>

            <div className="flex items-center justify-between py-2">
              <p
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Toggle Window
              </p>
              <kbd
                className="px-2 py-1 rounded text-xs font-mono"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Ctrl+Shift+P
              </kbd>
            </div>
          </section>

          {/* Updates Section */}
          <section>
            <h4
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Updates
            </h4>

            <div className="flex items-center justify-between py-2">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {updateAvailable
                    ? `Update available: v${updateAvailable.version}`
                    : `Current version: v${appVersion}`}
                </p>
                {updateAvailable && (
                  <p
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {updateAvailable.body || 'A new version is available'}
                  </p>
                )}
              </div>
              {updateAvailable ? (
                <button
                  onClick={installUpdate}
                  disabled={updating}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: 'var(--accent)',
                    color: '#ffffff',
                  }}
                >
                  {updating ? 'Installing...' : 'Install'}
                </button>
              ) : (
                <button
                  onClick={checkForUpdates}
                  disabled={checking}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {checking ? 'Checking...' : 'Check'}
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 text-center"
          style={{
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <span
            className="text-[10px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Unbind v{appVersion}
          </span>
        </div>
      </div>
    </div>
  )
}
