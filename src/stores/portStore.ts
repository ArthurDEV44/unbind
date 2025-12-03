import { create } from 'zustand'

export interface PortInfo {
  port: number
  pid: number
  processName: string
  protocol: 'tcp' | 'udp'
  startTime?: number
}

export interface Favorite {
  port: number
  label: string
}

interface PortStore {
  ports: PortInfo[]
  favorites: Favorite[]
  isLoading: boolean
  error: string | null
  refreshInterval: number

  setPorts: (ports: PortInfo[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setRefreshInterval: (interval: number) => void
  addFavorite: (favorite: Favorite) => void
  removeFavorite: (port: number) => void
  updateFavoriteLabel: (port: number, label: string) => void
}

export const usePortStore = create<PortStore>((set) => ({
  ports: [],
  favorites: [],
  isLoading: false,
  error: null,
  refreshInterval: 2000,

  setPorts: (ports) => set({ ports }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setRefreshInterval: (refreshInterval) => set({ refreshInterval }),

  addFavorite: (favorite) =>
    set((state) => ({
      favorites: [...state.favorites.filter((f) => f.port !== favorite.port), favorite],
    })),

  removeFavorite: (port) =>
    set((state) => ({
      favorites: state.favorites.filter((f) => f.port !== port),
    })),

  updateFavoriteLabel: (port, label) =>
    set((state) => ({
      favorites: state.favorites.map((f) =>
        f.port === port ? { ...f, label } : f
      ),
    })),
}))
