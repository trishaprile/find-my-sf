import Redis from 'ioredis'
import { Event } from '@/types/event'
import fs from 'fs'
import path from 'path'

const EVENTS_KEY = 'events:all'
const DATA_DIR = path.join(process.cwd(), '.data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')

// Create Redis client (only in production)
let redis: Redis | null = null

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null
  }
  
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })
  }
  
  return redis
}

// Check if we're in production (Redis environment)
const isProduction = !!process.env.REDIS_URL

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

// Redis-based storage functions (for production)
async function loadEventsFromRedis(): Promise<Event[]> {
  try {
    const client = getRedisClient()
    if (!client) {
      console.error('Redis client not available')
      return []
    }
    
    const data = await client.get(EVENTS_KEY)
    if (!data) {
      return []
    }
    
    return JSON.parse(data) as Event[]
  } catch (error) {
    console.error('Error loading from Redis:', error)
    return []
  }
}

async function saveEventsToRedis(events: Event[]): Promise<void> {
  try {
    const client = getRedisClient()
    if (!client) {
      throw new Error('Redis client not available')
    }
    
    await client.set(EVENTS_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Error saving to Redis:', error)
    throw error
  }
}

// Public API - automatically uses Redis in production, files locally
export async function loadEvents(): Promise<Event[]> {
  if (isProduction) {
    return await loadEventsFromRedis()
  } else {
    return loadEventsFromFile()
  }
}

export async function saveEvents(events: Event[]): Promise<void> {
  if (isProduction) {
    await saveEventsToRedis(events)
  } else {
    saveEventsToFile(events)
  }
}

// Migration helper: Copy local events to Redis (run once after setup)
export async function migrateToRedis(): Promise<void> {
  const localEvents = loadEventsFromFile()
  if (localEvents.length > 0) {
    await saveEventsToRedis(localEvents)
    console.log(`Migrated ${localEvents.length} events to Redis`)
  }
}
