# Unbind v1.0.0

First stable release of Unbind - A modern, cross-platform port manager that lives in your menu bar.

## Highlights

- **Cross-Platform** — Works on macOS, Windows, and Linux
- **54 Unit Tests** — Comprehensive test coverage (TypeScript + Rust)
- **3 Beautiful Themes** — Light, Dark, and Liquid Glass

## Features

### Core
- **Port Scanner** — Real-time list of all listening TCP/UDP ports with process info
- **One-Click Kill** — Terminate any process instantly
- **System Tray** — Lives in your menu bar, toggle with click or keyboard shortcut

### UX
- **Favorites** — Mark ports with custom labels (e.g., "Port 3000 = Next.js dev")
- **Kill History** — Track all terminated processes (last 50 entries)
- **Global Shortcut** — `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
- **Notifications** — Get alerted when favorite ports become occupied

### Polish
- **Filters** — Filter by port range or process name
- **Auto-Start** — Launch automatically on system boot
- **Themes** — Light, Dark, Liquid Glass + System detection

## Downloads

| Platform | Format |
|----------|--------|
| macOS | `.dmg` |
| Windows | `.msi` / `.exe` |
| Linux | `.deb` / `.AppImage` |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Tauri 2.9 |
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| State | Zustand |
| Backend | Rust |
| Database | SQLite |

## What's Next

- [ ] Code signing for distribution
- [ ] App screenshots
- [ ] Native platform testing validation
