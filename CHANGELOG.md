# Changelog

All notable changes to Unbind will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-03

### Added

#### Core Features
- **Port Scanner** — Real-time scanning of all listening TCP/UDP ports
  - Cross-platform support: Linux (`ss` + `/proc/net`), macOS (`lsof`), Windows (`netstat`)
  - Displays PID, process name, port number, and protocol
  - Configurable auto-refresh interval (1-10 seconds, default: 2s)

- **One-Click Kill** — Terminate any process instantly
  - Platform-native process termination (`kill -9` on Unix, `taskkill` on Windows)
  - Automatic rescan after kill

- **System Tray Integration** — Lives in your menu bar
  - Tray icon with context menu (Show/Hide, Quit)
  - Click to toggle window visibility
  - Smart positioning near tray icon
  - Auto-hide when window loses focus (release builds)

#### UX Features
- **Favorites System**
  - Mark frequently used ports as favorites
  - Custom labels (e.g., "Port 3000 = Next.js dev")
  - SQLite persistence
  - Visual indicators in port list

- **Kill History**
  - Track all terminated processes with timestamps
  - Last 50 entries stored
  - Clear history option

- **Global Keyboard Shortcut**
  - `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
  - Toggle panel visibility from anywhere

- **Desktop Notifications**
  - Alert when favorite ports become occupied
  - Smart notification throttling (no spam on startup)

#### Polish Features
- **Filters**
  - Filter by port range (min-max)
  - Filter by process name (substring match)
  - Configurable in Settings

- **Auto-Start**
  - Launch on system boot
  - Platform-native implementation (LaunchAgent, Registry, XDG autostart)
  - Toggle in Settings

- **Themes**
  - Light mode (Apple-inspired clean design)
  - Dark mode (modern dark interface)
  - Liquid Glass mode (glassmorphism with blur effects)
  - System theme detection
  - Preference persistence

#### Build & Distribution
- **Multi-Platform Builds**
  - Linux: `.deb` and `.AppImage`
  - macOS: `.dmg` (minimum macOS 10.15)
  - Windows: `.msi` and `.exe` with WebView2 bootstrapper

- **Auto-Update Support**
  - Tauri updater plugin configured
  - Update check UI in Settings

### Technical Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Zustand
- **Backend**: Rust, Tauri 2.9
- **Database**: SQLite (via Tauri SQL plugin)
- **Testing**: Vitest (31 tests), Cargo test (23 tests)

### Documentation
- Comprehensive README with:
  - Installation instructions for all platforms
  - Permission requirements (macOS, Windows, Linux)
  - Development setup guide
  - Testing commands
  - Contributing guidelines

---

## [Unreleased]

### Planned
- Code signing for distribution
- Screenshots in README
- Native macOS/Windows testing validation
