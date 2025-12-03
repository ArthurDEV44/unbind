# Unbind

A modern, cross-platform port manager that lives in your menu bar. Stop hunting for PIDs and killing processes manually.

## Features

- **Port Scanner** — Real-time list of all listening ports with process names and PIDs
- **One-Click Kill** — Terminate any process instantly
- **Favorites** — Mark frequently used ports with custom labels (e.g., "Port 3000 = Next.js dev")
- **Kill History** — Track all terminated processes with timestamps
- **Notifications** — Get alerted when favorite ports become occupied
- **Global Shortcut** — Toggle panel with `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
- **Auto-Start** — Launch automatically on system boot
- **Filters** — Filter by port range or process name
- **Cross-Platform** — Works on macOS, Windows, and Linux
- **Auto-Refresh** — Configurable polling interval (default: 2 seconds)
- **Modern UI** — Three beautiful themes: Light, Dark, and Liquid Glass

## Screenshots

*Coming soon*

## Installation

### Download

Pre-built binaries are available on the [Releases](https://github.com/your-username/unbind/releases) page:

| Platform | Download |
|----------|----------|
| macOS (Intel/Apple Silicon) | `.dmg` |
| Windows | `.msi` or `.exe` |
| Linux | `.deb` or `.AppImage` |

### Prerequisites (Development)

**Linux (Ubuntu/Debian)**
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libglib2.0-dev libcairo2-dev libpango1.0-dev libgdk-pixbuf-2.0-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev
```

**macOS**
```bash
xcode-select --install
```

**Windows**
- WebView2 Runtime (included in Windows 11, [download for Windows 10](https://developer.microsoft.com/en-us/microsoft-edge/webview2/))

### Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri:dev

# Run tests
pnpm test:run

# Run Rust tests
cd src-tauri && cargo test
```

### Build

```bash
# Build for production
pnpm tauri:build
```

Built packages are output to `src-tauri/target/release/bundle/`.

## Permissions

### macOS

Unbind requires the following permissions:

| Permission | Reason |
|------------|--------|
| **Accessibility** | Not required for basic functionality |
| **Network** | To scan listening ports via `lsof` |
| **Notifications** | To alert when favorite ports are occupied |

**Note:** On first launch, macOS may prompt you to allow the app. If you see "Unbind cannot be opened because Apple cannot check it for malicious software", right-click the app and select "Open" to bypass Gatekeeper.

For killing system processes (PID < 1000), you may need to run with elevated privileges or grant additional permissions.

### Windows

Unbind runs with standard user permissions for most operations. However:

| Scenario | Permission Required |
|----------|---------------------|
| Scanning ports | Standard user |
| Killing user processes | Standard user |
| Killing system processes | **Administrator** |

To kill system processes, right-click Unbind and select **"Run as Administrator"**.

**Windows Defender SmartScreen:** On first launch, Windows may show a warning. Click "More info" → "Run anyway" to proceed.

### Linux

Unbind uses `ss` command to scan ports and `kill` command to terminate processes.

| Scenario | Permission Required |
|----------|---------------------|
| Scanning user ports | Standard user |
| Scanning all ports | May require `sudo` or CAP_NET_ADMIN |
| Killing user processes | Standard user |
| Killing other users' processes | `sudo` or root |

For full functionality, you may run:
```bash
# Grant network capabilities (optional, for enhanced scanning)
sudo setcap cap_net_admin+ep /path/to/unbind
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
| Testing | Vitest, Cargo Test |

## Themes

| Theme | Description |
|-------|-------------|
| Light | Clean Apple-inspired design |
| Dark | Modern dark interface |
| Glass | Liquid Glass with blur effects |

Theme preference is saved automatically and can follow your system settings.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+P` (macOS) | Toggle panel visibility |
| `Ctrl+Shift+P` (Windows/Linux) | Toggle panel visibility |

## Configuration

Settings are accessible via the gear icon in the top-right corner:

- **Refresh Interval** — Set auto-refresh rate (1-10 seconds)
- **Auto-Start** — Launch on system boot
- **Theme** — Light, Dark, Glass, or System
- **Filters** — Set port range and process name filters
- **Notifications** — Enable/disable favorite port alerts

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Roadmap

See [TODO.md](./TODO.md) for the full roadmap.

- [x] Phase 1 — Core MVP (Scanner, Kill, UI)
- [x] Phase 2 — UX (Favorites, History, Shortcuts, Notifications)
- [x] Phase 3 — Polish (Filters, Auto-start, Themes)
- [x] Phase 4 — Build & Release Configuration
- [x] Tests & Documentation

## Testing

```bash
# Run all TypeScript tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run Rust tests
cd src-tauri && cargo test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
