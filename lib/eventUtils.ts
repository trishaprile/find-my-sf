import type { Event } from '@/types/event'

/**
 * Formats price for display, adding "From $" prefix if applicable
 */
export function formatPriceDisplay(price: string): string {
  if (!price || price.toLowerCase() === 'free' || price === '0') {
    return 'Free'
  }
  
  // If it already has "From", return as is
  if (price.toLowerCase().includes('from')) {
    return price
  }
  
  // If it has "$", add "From" prefix
  if (price.includes('$')) {
    return `From ${price}`
  }
  
  // Otherwise, add "From $" prefix
  return `From $${price}`
}

/**
 * Gets the current year in Pacific timezone
 */
function getCurrentYearPT(): string {
  return new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric' })
}

/**
 * Converts a display date (e.g. "JAN 13") to input format (e.g. "2026-01-13")
 */
export function parseDateToInput(displayDate: string): string {
  try {
    const dateStr = `${displayDate} ${getCurrentYearPT()} 12:00:00`
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    
    // Format for date input in Pacific time
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const parts = formatter.formatToParts(date)
    const year = parts.find(p => p.type === 'year')?.value
    const month = parts.find(p => p.type === 'month')?.value
    const day = parts.find(p => p.type === 'day')?.value
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * Calculates the day of the week from a date input string (e.g. "2026-01-13")
 */
export function calculateDayFromDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  if (isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    timeZone: 'America/Los_Angeles'
  }).toUpperCase()
}

/**
 * Formats a date input string to display format (e.g. "2026-01-13" to "JAN 13")
 */
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  }).toUpperCase()
}

/**
 * Calculates the day of the week from a display date string (e.g. "JAN 13")
 */
export function calculateDayFromDisplayDate(displayDate: string): string {
  const date = new Date(`${displayDate} ${getCurrentYearPT()} 12:00:00`)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    timeZone: 'America/Los_Angeles'
  }).toUpperCase()
}

/**
 * Formats a date range for display, including days of the week
 */
export function formatDateRange(startDate: string, endDate?: string, startDay?: string): string {
  if (endDate) {
    const endDay = calculateDayFromDisplayDate(endDate)
    return `${startDay} ${startDate} - ${endDay} ${endDate}`
  }
  return startDay ? `${startDay} ${startDate}` : startDate
}

/**
 * Parses an event date string into a Date object (Pacific timezone)
 */
export function parseEventDate(dateString: string): Date {
  const parsed = new Date(`${dateString} ${getCurrentYearPT()} 12:00:00`)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

/**
 * Sorts events chronologically by date
 */
export function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const dateA = parseEventDate(a.date)
    const dateB = parseEventDate(b.date)
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Checks if an event has passed (date is before today in Pacific timezone)
 */
export function hasEventPassed(event: Event): boolean {
  // Get current date in Pacific timezone at start of day
  const now = new Date()
  const todayPT = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  todayPT.setHours(0, 0, 0, 0)
  
  // Use end date if available, otherwise use start date
  const eventDateString = event.endDate || event.date
  const eventDate = parseEventDate(eventDateString)
  eventDate.setHours(23, 59, 59, 999) // End of event day
  
  return eventDate < todayPT
}

/**
 * Filters out events that have passed
 */
export function filterUpcomingEvents(events: Event[]): Event[] {
  return events.filter(event => !hasEventPassed(event))
}

/**
 * Filters out events that are upcoming (keeps only past events)
 */
export function filterPastEvents(events: Event[]): Event[] {
  return events.filter(event => hasEventPassed(event))
}

