import { describe, it, expect, beforeEach } from 'vitest'
import { usePortStore, type PortInfo, type Favorite } from './portStore'

describe('portStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    usePortStore.setState({
      ports: [],
      favorites: [],
      isLoading: false,
      error: null,
      refreshInterval: 2000,
    })
  })

  describe('ports management', () => {
    it('should set ports', () => {
      const mockPorts: PortInfo[] = [
        { port: 3000, pid: 1234, processName: 'node', protocol: 'tcp' },
        { port: 8080, pid: 5678, processName: 'java', protocol: 'tcp' },
      ]

      usePortStore.getState().setPorts(mockPorts)

      expect(usePortStore.getState().ports).toEqual(mockPorts)
    })

    it('should replace existing ports', () => {
      const initialPorts: PortInfo[] = [
        { port: 3000, pid: 1234, processName: 'node', protocol: 'tcp' },
      ]
      const newPorts: PortInfo[] = [
        { port: 8080, pid: 5678, processName: 'java', protocol: 'tcp' },
      ]

      usePortStore.getState().setPorts(initialPorts)
      usePortStore.getState().setPorts(newPorts)

      expect(usePortStore.getState().ports).toEqual(newPorts)
    })
  })

  describe('loading state', () => {
    it('should set loading state to true', () => {
      usePortStore.getState().setLoading(true)
      expect(usePortStore.getState().isLoading).toBe(true)
    })

    it('should set loading state to false', () => {
      usePortStore.getState().setLoading(true)
      usePortStore.getState().setLoading(false)
      expect(usePortStore.getState().isLoading).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should set error message', () => {
      usePortStore.getState().setError('Something went wrong')
      expect(usePortStore.getState().error).toBe('Something went wrong')
    })

    it('should clear error', () => {
      usePortStore.getState().setError('Some error')
      usePortStore.getState().setError(null)
      expect(usePortStore.getState().error).toBeNull()
    })
  })

  describe('refresh interval', () => {
    it('should have default refresh interval of 2000ms', () => {
      expect(usePortStore.getState().refreshInterval).toBe(2000)
    })

    it('should update refresh interval', () => {
      usePortStore.getState().setRefreshInterval(5000)
      expect(usePortStore.getState().refreshInterval).toBe(5000)
    })
  })

  describe('favorites management', () => {
    it('should add a favorite', () => {
      const favorite: Favorite = { port: 3000, label: 'Next.js' }

      usePortStore.getState().addFavorite(favorite)

      expect(usePortStore.getState().favorites).toContainEqual(favorite)
    })

    it('should replace existing favorite with same port', () => {
      const favorite1: Favorite = { port: 3000, label: 'React' }
      const favorite2: Favorite = { port: 3000, label: 'Next.js' }

      usePortStore.getState().addFavorite(favorite1)
      usePortStore.getState().addFavorite(favorite2)

      expect(usePortStore.getState().favorites).toHaveLength(1)
      expect(usePortStore.getState().favorites[0].label).toBe('Next.js')
    })

    it('should add multiple favorites with different ports', () => {
      const favorite1: Favorite = { port: 3000, label: 'Next.js' }
      const favorite2: Favorite = { port: 8080, label: 'Spring Boot' }

      usePortStore.getState().addFavorite(favorite1)
      usePortStore.getState().addFavorite(favorite2)

      expect(usePortStore.getState().favorites).toHaveLength(2)
    })

    it('should remove a favorite by port', () => {
      const favorite: Favorite = { port: 3000, label: 'Next.js' }

      usePortStore.getState().addFavorite(favorite)
      usePortStore.getState().removeFavorite(3000)

      expect(usePortStore.getState().favorites).toHaveLength(0)
    })

    it('should not affect other favorites when removing one', () => {
      const favorite1: Favorite = { port: 3000, label: 'Next.js' }
      const favorite2: Favorite = { port: 8080, label: 'Spring Boot' }

      usePortStore.getState().addFavorite(favorite1)
      usePortStore.getState().addFavorite(favorite2)
      usePortStore.getState().removeFavorite(3000)

      expect(usePortStore.getState().favorites).toHaveLength(1)
      expect(usePortStore.getState().favorites[0].port).toBe(8080)
    })

    it('should update a favorite label', () => {
      const favorite: Favorite = { port: 3000, label: 'React' }

      usePortStore.getState().addFavorite(favorite)
      usePortStore.getState().updateFavoriteLabel(3000, 'Next.js')

      expect(usePortStore.getState().favorites[0].label).toBe('Next.js')
    })

    it('should not affect other favorites when updating label', () => {
      const favorite1: Favorite = { port: 3000, label: 'React' }
      const favorite2: Favorite = { port: 8080, label: 'Spring Boot' }

      usePortStore.getState().addFavorite(favorite1)
      usePortStore.getState().addFavorite(favorite2)
      usePortStore.getState().updateFavoriteLabel(3000, 'Next.js')

      expect(usePortStore.getState().favorites).toHaveLength(2)
      expect(usePortStore.getState().favorites.find((f) => f.port === 8080)?.label).toBe(
        'Spring Boot'
      )
    })

    it('should handle updating non-existent favorite gracefully', () => {
      usePortStore.getState().updateFavoriteLabel(9999, 'Ghost')

      expect(usePortStore.getState().favorites).toHaveLength(0)
    })
  })
})
