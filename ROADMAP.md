# Unbind - Port Manager Menu Bar App

## Contexte
Application menu bar cross-platform (macOS/Windows) pour gérer les ports système. Résout le workflow répétitif : `lsof -i :3000` → copier PID → `kill -9 PID`.

## Stack technique
- **Framework** : Tauri latest (Rust backend + WebView frontend)
- **Frontend** : React 19 + TypeScript + Tailwind CSS
- **System** : Rust pour les appels système (netstat, lsof, taskkill)
- **State** : Zustand pour le state management
- **Storage** : SQLite via Tauri pour persistance (favoris, historique)
- **Package Manager** : bun ou pnpm fait une recherche si besoin pour savoir lequel est le plus adaptéà ce projet
IMPORTANT : n'utilise jamais npm.

## Fonctionnalités à implémenter

### Phase 1 - Core (MVP)
1. **System tray icon** avec menu contextuel
2. **Scanner de ports** : lister tous les ports en écoute avec PID, nom du process, durée
3. **Kill process** : bouton one-click pour terminer un process
4. **Refresh** : polling toutes les 2 secondes (configurable)

### Phase 2 - UX
5. **Favoris** : marquer un port avec un label custom ("Port 3000 = Next.js dev")
6. **Historique** : log des 50 derniers kills avec timestamp
7. **Raccourci clavier** : Cmd+Shift+P pour ouvrir le panel
8. **Notifications** : alerte quand un port favori est occupé

### Phase 3 - Polish
9. **Filtres** : par range de ports, par nom de process
10. **Auto-start** : lancer au démarrage système
11. **Theme** : light/dark selon système

## Règles de développement
- **Pas de unwrap()** en Rust, utiliser `?` et Result partout
- **Tests unitaires** pour le scanner de ports (mock les appels système)
- **Gestion d'erreurs** : messages user-friendly côté frontend
- **Performance** : le scan ne doit pas bloquer l'UI (async)
- **Permissions** : documenter les permissions nécessaires (macOS sandbox, Windows admin si besoin)

## Livrables attendus
1. App fonctionnelle qui se lance dans la system tray
2. Liste des ports rafraîchie en temps réel
3. Kill fonctionnel sur macOS et Windows
4. Persistance des favoris entre sessions
5. README avec instructions d'installation et screenshots