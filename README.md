# Unbind

A modern, cross-platform port manager that lives in your menu bar. Stop hunting for PIDs and killing processes manually.

## Features

- **Port Scanner** — Real-time list of all listening ports with process names and PIDs
- **One-Click Kill** — Terminate any process instantly
- **Cross-Platform** — Works on macOS, Windows, and Linux
- **Auto-Refresh** — Automatic polling every 2 seconds
- **Modern UI** — Three beautiful themes: Light, Dark, and Liquid Glass

## Screenshots

*Coming soon*

## Installation

### Prerequisites

**Linux (Ubuntu/Debian)**
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libglib2.0-dev libcairo2-dev libpango1.0-dev libgdk-pixbuf-2.0-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev
```

**macOS**
- Xcode Command Line Tools

**Windows**
- WebView2 Runtime (included in Windows 11)

### Development

```bash
pnpm install
pnpm tauri:dev
```

### Build

```bash
pnpm tauri:build
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Tauri 2.9 |
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Backend | Rust |
| Database | SQLite |

## Themes

| Theme | Description |
|-------|-------------|
| Light | Clean Apple-inspired design |
| Dark | Modern dark interface |
| Glass | Liquid Glass with blur effects |

## Roadmap

See [TODO.md](./TODO.md) for the full roadmap.

- [x] Phase 1 — Core MVP (Scanner, Kill, UI)
- [ ] Phase 2 — UX (Favorites, History, Shortcuts)
- [ ] Phase 3 — Polish (Filters, Auto-start)
- [ ] Phase 4 — Build & Release

## License

MIT
