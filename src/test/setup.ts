import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock window.__TAURI_INTERNALS__ for Tauri detection
Object.defineProperty(window, '__TAURI_INTERNALS__', {
  value: {},
  writable: true,
  configurable: true,
})

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock @tauri-apps/plugin-sql
vi.mock('@tauri-apps/plugin-sql', () => {
  const mockDb = {
    execute: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue([]),
  }

  return {
    default: {
      load: vi.fn().mockResolvedValue(mockDb),
    },
  }
})

// Mock @tauri-apps/plugin-notification
vi.mock('@tauri-apps/plugin-notification', () => ({
  isPermissionGranted: vi.fn().mockResolvedValue(true),
  requestPermission: vi.fn().mockResolvedValue('granted'),
  sendNotification: vi.fn(),
}))

// Mock @tauri-apps/plugin-autostart
vi.mock('@tauri-apps/plugin-autostart', () => ({
  enable: vi.fn().mockResolvedValue(undefined),
  disable: vi.fn().mockResolvedValue(undefined),
  isEnabled: vi.fn().mockResolvedValue(false),
}))

// Mock @tauri-apps/plugin-updater
vi.mock('@tauri-apps/plugin-updater', () => ({
  check: vi.fn().mockResolvedValue(null),
}))

// Mock @tauri-apps/plugin-process
vi.mock('@tauri-apps/plugin-process', () => ({
  relaunch: vi.fn().mockResolvedValue(undefined),
}))
