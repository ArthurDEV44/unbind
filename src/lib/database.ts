import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:unbind.db')
    await initializeTables()
  }
  return db
}

async function initializeTables(): Promise<void> {
  if (!db) return

  await db.execute(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      port INTEGER UNIQUE NOT NULL,
      label TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS kill_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      port INTEGER NOT NULL,
      pid INTEGER NOT NULL,
      process_name TEXT NOT NULL,
      killed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_kill_history_killed_at
    ON kill_history(killed_at DESC)
  `)
}

export interface FavoriteRecord {
  id: number
  port: number
  label: string
  created_at: string
}

export interface KillHistoryRecord {
  id: number
  port: number
  pid: number
  process_name: string
  killed_at: string
}

export async function getFavorites(): Promise<FavoriteRecord[]> {
  const database = await getDatabase()
  return database.select<FavoriteRecord[]>('SELECT * FROM favorites ORDER BY port')
}

export async function addFavorite(port: number, label: string): Promise<void> {
  const database = await getDatabase()
  await database.execute(
    'INSERT OR REPLACE INTO favorites (port, label) VALUES ($1, $2)',
    [port, label]
  )
}

export async function removeFavorite(port: number): Promise<void> {
  const database = await getDatabase()
  await database.execute('DELETE FROM favorites WHERE port = $1', [port])
}

export async function updateFavoriteLabel(port: number, label: string): Promise<void> {
  const database = await getDatabase()
  await database.execute(
    'UPDATE favorites SET label = $1 WHERE port = $2',
    [label, port]
  )
}

export async function addKillHistory(
  port: number,
  pid: number,
  processName: string
): Promise<void> {
  const database = await getDatabase()

  await database.execute(
    'INSERT INTO kill_history (port, pid, process_name) VALUES ($1, $2, $3)',
    [port, pid, processName]
  )

  await database.execute(`
    DELETE FROM kill_history
    WHERE id NOT IN (
      SELECT id FROM kill_history ORDER BY killed_at DESC LIMIT 50
    )
  `)
}

export async function getKillHistory(): Promise<KillHistoryRecord[]> {
  const database = await getDatabase()
  return database.select<KillHistoryRecord[]>(
    'SELECT * FROM kill_history ORDER BY killed_at DESC LIMIT 50'
  )
}

export async function clearKillHistory(): Promise<void> {
  const database = await getDatabase()
  await database.execute('DELETE FROM kill_history')
}
