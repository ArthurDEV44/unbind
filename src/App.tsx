import { useEffect, useState } from 'react'
import { PortList } from './components/PortList'
import { HistoryPanel } from './components/History'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { useThemeStore } from './stores/themeStore'
import { useFavoritePortNotifications } from './hooks/useNotifications'

function App() {
  const { theme } = useThemeStore()
  const [showHistory, setShowHistory] = useState(false)

  // Enable notifications for favorite ports
  useFavoritePortNotifications()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const isGlass = theme === 'glass'

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${isGlass ? 'glass-effect' : ''}`}
      style={{
        background: isGlass ? 'var(--glass-bg)' : 'var(--bg-primary)',
        borderRadius: '12px',
        border: isGlass ? '1px solid var(--glass-border)' : '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: isGlass ? 'transparent' : 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
        }}
        data-tauri-drag-region
      >
        {/* Logo & Title */}
        <div className="flex items-center gap-2" data-tauri-drag-region>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
            }}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
            data-tauri-drag-region
          >
            Unbind
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
            title="Kill History"
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>
      </header>

      {/* History Panel */}
      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <PortList />
      </main>

      {/* Footer */}
      <footer
        className="flex items-center justify-center px-4 py-2"
        style={{
          background: isGlass ? 'transparent' : 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <span
          className="text-[10px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Auto-refresh every 2s
        </span>
      </footer>
    </div>
  )
}

export default App
