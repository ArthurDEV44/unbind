# TODO - Unbind

## Setup Initial
- [x] Initialiser le projet Tauri (choix: pnpm)
- [x] Configurer React 19 + TypeScript
- [x] Configurer Tailwind CSS 4
- [x] Setup Zustand pour le state management
- [x] Configurer SQLite via Tauri

## Phase 1 - Core (MVP)

### System Tray
- [x] Créer l'icône system tray
- [x] Implémenter le menu contextuel (Show/Hide, Quit)
- [x] Toggle fenêtre au clic sur l'icône
- [x] Cacher fenêtre quand elle perd le focus
- [x] Positionner fenêtre près du tray icon

### Scanner de Ports (Rust Backend)
- [x] Implémenter scanner Linux (`ss` + fallback `/proc/net`)
- [x] Implémenter `lsof` pour macOS
- [x] Implémenter `netstat` pour Windows
- [x] Retourner : PID, nom du process, port, protocole
- [x] Gestion d'erreurs avec Result (pas de unwrap)

### Kill Process
- [x] Implémenter kill process Linux/macOS (`kill -9`)
- [x] Implémenter kill process Windows (`taskkill`)
- [x] Bouton one-click côté frontend

### Interface React
- [x] Composant liste des ports (PortList)
- [x] Affichage PID, nom, port, protocole
- [x] Bouton kill par ligne
- [x] Bouton refresh manuel

### Polling
- [x] Refresh automatique toutes les 2 secondes
- [x] Rendre l'intervalle configurable (via store)
- [x] S'assurer que le scan est async (non-bloquant)

## Phase 2 - UX

### Favoris
- [x] Schema SQLite pour les favoris
- [x] CRUD favoris (via TypeScript + Tauri SQL plugin)
- [x] UI pour marquer un port comme favori
- [x] Labels custom (ex: "Port 3000 = Next.js dev")

### Historique
- [x] Schema SQLite pour l'historique
- [x] Logger les kills (timestamp, port, process)
- [x] Limiter à 50 entrées
- [x] UI pour consulter l'historique

### Raccourci Clavier
- [x] Enregistrer Cmd+Shift+P (macOS) / Ctrl+Shift+P (Windows/Linux)
- [x] Ouvrir/fermer le panel

### Notifications
- [x] Détecter quand un port favori est occupé
- [x] Envoyer notification système

## Phase 3 - Polish

### Filtres
- [ ] Filtre par range de ports
- [ ] Filtre par nom de process
- [ ] UI de filtrage

### Auto-start
- [ ] Lancer au démarrage macOS
- [ ] Lancer au démarrage Windows
- [ ] Toggle dans les settings

### Theme
- [x] Mode Light (design Apple-like)
- [x] Mode Dark (design moderne)
- [x] Mode Liquid Glass (glassmorphism)
- [x] ThemeSwitcher component
- [x] Persistance du thème (localStorage)
- [ ] Détecter le thème système automatiquement

## Phase 4 - Build & Release

### Mode Menu Bar (builds natifs)
- [ ] Réactiver `visible: false` dans tauri.conf.json
- [ ] Réactiver `decorations: false` pour fenêtre sans bordure
- [ ] Réactiver `skipTaskbar: true`
- [ ] Réactiver `alwaysOnTop: true`
- [ ] Réactiver "hide on blur" dans lib.rs (cacher fenêtre quand elle perd le focus)
- [ ] Tester sur macOS natif
- [ ] Tester sur Windows natif

### Build & Distribution
- [ ] Build macOS (.dmg)
- [ ] Build Windows (.msi / .exe)
- [ ] Build Linux (.deb / .AppImage)
- [ ] Signer l'application (code signing)
- [ ] Configurer auto-update

## Tests & Documentation

### Tests
- [ ] Tests unitaires scanner de ports (mocks)
- [ ] Tests kill process
- [ ] Tests CRUD favoris/historique

### Documentation
- [ ] README avec instructions d'installation
- [ ] Screenshots de l'app
- [ ] Documenter permissions macOS sandbox
- [ ] Documenter permissions Windows (admin si nécessaire)

## Notes
- **Jamais utiliser npm** - uniquement bun ou pnpm
- **Pas de unwrap()** en Rust - toujours Result et `?`
- **Messages d'erreurs user-friendly** côté frontend

## Dépendances Système

### Linux (Ubuntu/Debian)
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### macOS
Xcode Command Line Tools requis

### Windows
WebView2 runtime (inclus dans Windows 11, à installer sur Windows 10)
