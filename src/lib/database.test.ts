import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create mock functions at module level
const mockExecute = vi.fn()
const mockSelect = vi.fn()

// Mock the Database module BEFORE any imports that use it
vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: vi.fn().mockImplementation(() =>
      Promise.resolve({
        execute: mockExecute,
        select: mockSelect,
      })
    ),
  },
}))

// Import after mock setup
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavoriteLabel,
  addKillHistory,
  getKillHistory,
  clearKillHistory,
  type FavoriteRecord,
  type KillHistoryRecord,
} from './database'

describe('Database', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExecute.mockResolvedValue(undefined)
    mockSelect.mockResolvedValue([])
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('Favorites CRUD', () => {
    it('should get all favorites ordered by port', async () => {
      const mockFavorites: FavoriteRecord[] = [
        { id: 1, port: 3000, label: 'Next.js', created_at: '2024-01-01' },
        { id: 2, port: 8080, label: 'Spring Boot', created_at: '2024-01-02' },
      ]
      mockSelect.mockResolvedValueOnce(mockFavorites)

      const favorites = await getFavorites()

      expect(mockSelect).toHaveBeenCalledWith('SELECT * FROM favorites ORDER BY port')
      expect(favorites).toEqual(mockFavorites)
    })

    it('should add a new favorite', async () => {
      await addFavorite(3000, 'Next.js')

      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT OR REPLACE INTO favorites (port, label) VALUES ($1, $2)',
        [3000, 'Next.js']
      )
    })

    it('should remove a favorite by port', async () => {
      await removeFavorite(3000)

      expect(mockExecute).toHaveBeenCalledWith(
        'DELETE FROM favorites WHERE port = $1',
        [3000]
      )
    })

    it('should update a favorite label', async () => {
      await updateFavoriteLabel(3000, 'Updated Label')

      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE favorites SET label = $1 WHERE port = $2',
        ['Updated Label', 3000]
      )
    })
  })

  describe('Kill History CRUD', () => {
    it('should add a kill to history', async () => {
      await addKillHistory(3000, 1234, 'node')

      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO kill_history (port, pid, process_name) VALUES ($1, $2, $3)',
        [3000, 1234, 'node']
      )
    })

    it('should prune history to 50 records after adding', async () => {
      await addKillHistory(3000, 1234, 'node')

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM kill_history')
      )
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 50')
      )
    })

    it('should get kill history ordered by date desc', async () => {
      const mockHistory: KillHistoryRecord[] = [
        { id: 1, port: 3000, pid: 1234, process_name: 'node', killed_at: '2024-01-02' },
        { id: 2, port: 8080, pid: 5678, process_name: 'java', killed_at: '2024-01-01' },
      ]
      mockSelect.mockResolvedValueOnce(mockHistory)

      const history = await getKillHistory()

      expect(mockSelect).toHaveBeenCalledWith(
        'SELECT * FROM kill_history ORDER BY killed_at DESC LIMIT 50'
      )
      expect(history).toEqual(mockHistory)
    })

    it('should clear all kill history', async () => {
      await clearKillHistory()

      expect(mockExecute).toHaveBeenCalledWith('DELETE FROM kill_history')
    })
  })
})
