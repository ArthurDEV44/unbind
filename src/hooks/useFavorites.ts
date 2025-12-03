import { useEffect, useCallback } from 'react'
import { usePortStore, type Favorite } from '../stores/portStore'
import {
  getFavorites,
  addFavorite as dbAddFavorite,
  removeFavorite as dbRemoveFavorite,
  updateFavoriteLabel as dbUpdateFavoriteLabel,
  type FavoriteRecord,
} from '../lib/database'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function useFavorites() {
  const { favorites, addFavorite, removeFavorite, updateFavoriteLabel } = usePortStore()

  // Load favorites from database on mount
  useEffect(() => {
    if (!isTauri()) return

    const loadFavorites = async () => {
      try {
        const records = await getFavorites()
        records.forEach((record: FavoriteRecord) => {
          addFavorite({ port: record.port, label: record.label })
        })
      } catch (error) {
        console.error('Failed to load favorites:', error)
      }
    }

    loadFavorites()
  }, [addFavorite])

  // Add favorite with DB sync
  const addFavoriteWithSync = useCallback(
    async (favorite: Favorite): Promise<boolean> => {
      if (!isTauri()) return false

      try {
        await dbAddFavorite(favorite.port, favorite.label)
        addFavorite(favorite)
        return true
      } catch (error) {
        console.error('Failed to add favorite:', error)
        return false
      }
    },
    [addFavorite]
  )

  // Remove favorite with DB sync
  const removeFavoriteWithSync = useCallback(
    async (port: number): Promise<boolean> => {
      if (!isTauri()) return false

      try {
        await dbRemoveFavorite(port)
        removeFavorite(port)
        return true
      } catch (error) {
        console.error('Failed to remove favorite:', error)
        return false
      }
    },
    [removeFavorite]
  )

  // Update favorite label with DB sync
  const updateFavoriteLabelWithSync = useCallback(
    async (port: number, label: string): Promise<boolean> => {
      if (!isTauri()) return false

      try {
        await dbUpdateFavoriteLabel(port, label)
        updateFavoriteLabel(port, label)
        return true
      } catch (error) {
        console.error('Failed to update favorite label:', error)
        return false
      }
    },
    [updateFavoriteLabel]
  )

  // Check if a port is a favorite
  const isFavorite = useCallback(
    (port: number): boolean => {
      return favorites.some((f) => f.port === port)
    },
    [favorites]
  )

  // Get favorite label for a port
  const getFavoriteLabel = useCallback(
    (port: number): string | undefined => {
      return favorites.find((f) => f.port === port)?.label
    },
    [favorites]
  )

  return {
    favorites,
    addFavorite: addFavoriteWithSync,
    removeFavorite: removeFavoriteWithSync,
    updateFavoriteLabel: updateFavoriteLabelWithSync,
    isFavorite,
    getFavoriteLabel,
  }
}
