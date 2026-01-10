import fs from 'fs'
import path from 'path'
import { Event } from '@/types/event'

const DATA_DIR = path.join(process.cwd(), '.data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function loadEvents(): Event[] {
  ensureDataDir()
  if (fs.existsSync(EVENTS_FILE)) {
    const data = fs.readFileSync(EVENTS_FILE, 'utf-8')
    return JSON.parse(data) as Event[]
  }
  return []
}

export function saveEvents(events: Event[]) {
  ensureDataDir()
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8')
}

