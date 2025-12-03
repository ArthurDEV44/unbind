import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PortFilter {
  minPort: number | null
  maxPort: number | null
  processName: string
}

interface SettingsStore {
  // Filters
  filter: PortFilter
  setFilter: (filter: Partial<PortFilter>) => void
  resetFilter: () => void

  // Auto-start
  autoStart: boolean
  setAutoStart: (enabled: boolean) => void

  // Theme
  useSystemTheme: boolean
  setUseSystemTheme: (enabled: boolean) => void
}

const defaultFilter: PortFilter = {
  minPort: null,
  maxPort: null,
  processName: '',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Filters
      filter: defaultFilter,
      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
        })),
      resetFilter: () => set({ filter: defaultFilter }),

      // Auto-start
      autoStart: false,
      setAutoStart: (autoStart) => set({ autoStart }),

      // Theme
      useSystemTheme: false,
      setUseSystemTheme: (useSystemTheme) => set({ useSystemTheme }),
    }),
    {
      name: 'unbind-settings',
    }
  )
)
