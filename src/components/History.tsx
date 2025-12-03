import { useHistory } from '../hooks/useHistory'
import type { KillHistoryRecord } from '../lib/database'

interface HistoryItemProps {
  record: KillHistoryRecord
}

function HistoryItem({ record }: HistoryItemProps) {
  const date = new Date(record.killed_at)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderBottom: '1px solid var(--border-light)' }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Port badge */}
        <div
          className="flex items-center justify-center min-w-[56px] px-2 py-1 rounded-md font-mono text-xs font-medium"
          style={{
            background: 'var(--danger)',
            color: '#ffffff',
            opacity: 0.9,
          }}
        >
          :{record.port}
        </div>

        {/* Process info */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {record.process_name}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            PID {record.pid}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex flex-col items-end">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {timeStr}
        </span>
        <span
          className="text-[10px]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {dateStr}
        </span>
      </div>
    </div>
  )
}

function EmptyHistoryState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <svg
          className="w-7 h-7"
          style={{ color: 'var(--text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        No kill history
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Killed processes will appear here.
      </p>
    </div>
  )
}

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const { history, isLoading, clearHistory } = useHistory()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-[360px] max-h-[80vh] flex flex-col shadow-xl overflow-hidden"
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Kill History
            </h3>
            {history.length > 0 && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-tertiary)',
                }}
              >
                {history.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => clearHistory()}
                className="text-xs px-2 py-1 rounded-md transition-colors"
                style={{
                  color: 'var(--danger)',
                  background: 'rgba(255, 59, 48, 0.1)',
                }}
                title="Clear history"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : history.length === 0 ? (
            <EmptyHistoryState />
          ) : (
            history.map((record) => (
              <HistoryItem key={record.id} record={record} />
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
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
              Showing last {history.length} kills (max 50)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
