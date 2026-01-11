import { kv } from '@vercel/kv'
import { Event } from '@/types/event'
import fs from 'fs'
import path from 'path'

const EVENTS_KEY = 'events:all'
const DATA_DIR = path.join(process.cwd(), '.data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')

// Check if we're in production (Vercel environment)
const isProduction = process.env.KV_REST_API_URL !== undefined

// File-based storage functions (for local development)
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadEventsFromFile(): Event[] {
  ensureDataDir()
  if (fs.existsSync(EVENTS_FILE)) {
    const data = fs.readFileSync(EVENTS_FILE, 'utf-8')
    return JSON.parse(data) as Event[]
  }
  return []
}

function saveEventsToFile(events: Event[]) {
  ensureDataDir()
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8')
}

// KV-based storage functions (for production)
async function loadEventsFromKV(): Promise<Event[]> {
  try {
    const events = await kv.get<Event[]>(EVENTS_KEY)
    return events || []
  } catch (error) {
    console.error('Error loading from KV:', error)
    return []
  }
}

async function saveEventsToKV(events: Event[]): Promise<void> {
  try {
    await kv.set(EVENTS_KEY, events)
  } catch (error) {
    console.error('Error saving to KV:', error)
    throw error
  }
}

// Public API - automatically uses KV in production, files locally
export async function loadEvents(): Promise<Event[]> {
  if (isProduction) {
    return await loadEventsFromKV()
  } else {
    return loadEventsFromFile()
  }
}

export async function saveEvents(events: Event[]): Promise<void> {
  if (isProduction) {
    await saveEventsToKV(events)
  } else {
    saveEventsToFile(events)
  }
}

// Migration helper: Copy local events to KV (run once after setup)
export async function migrateToKV(): Promise<void> {
  const localEvents = loadEventsFromFile()
  if (localEvents.length > 0) {
    await saveEventsToKV(localEvents)
    console.log(`Migrated ${localEvents.length} events to KV`)
  }
}

