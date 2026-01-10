'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { CATEGORIES, getCategoryByName, getCategoryId } from '@/lib/categories'
import { formatPriceDisplay, formatDateRange, sortEventsByDate, filterUpcomingEvents } from '@/lib/eventUtils'
import type { Event } from '@/types/event'

export default function Home() {
  const [activities] = useState(() => {
    const list = ['community', 'craft fair', 'forest bath', 'sewing bootcamp', 'zine workshop', 'mahjong club', 'night market', 'pottery class', 'art showcase', 'writing group']
    return [list[0], ...list.slice(1).sort(() => Math.random() - 0.5)]
  })
  const [currentActivity, setCurrentActivity] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [activities])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Filter out past events and apply category filters
  const upcomingEvents = filterUpcomingEvents(events)
  
  const filteredEvents = sortEventsByDate(
    selectedCategories.length > 0
      ? upcomingEvents.filter(event => 
          event.tags.some(tag => selectedCategories.includes(getCategoryId(tag)))
        )
      : upcomingEvents
  )

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.headingContainer}>
        <p className={styles.topText}>What do I do in</p>
        <h1 className={styles.mainHeading}>SAN FRANCISCO?</h1>
        <p className={styles.subText}>Find your local <span key={currentActivity} className={styles.activityText}>{activities[currentActivity]}</span></p>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.categoryFilters}>
          {CATEGORIES.map((category) => {
            const categoryId = getCategoryId(category.name)
            const Icon = category.icon
            const isActive = selectedCategories.includes(categoryId)
            
            return (
              <button
                key={categoryId}
                className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ''}`}
                onClick={() => toggleCategory(categoryId)}
                data-category={category.name}
              >
                <Icon className={styles.categoryIcon} size={14} strokeWidth={2} />
                <span>{category.name}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.eventsGrid}>
          {loading ? (
            <p className={styles.loadingText}>Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p className={styles.emptyText}>
              {selectedCategories.length > 0 ? 'No events found for the selected categories.' : 'No events available.'}
            </p>
          ) : (
            filteredEvents.map((event) => (
              <a
                key={event.id}
                href={event.link || '#'}
                target={event.link ? '_blank' : undefined}
                rel={event.link ? 'noopener noreferrer' : undefined}
                className={styles.eventCard}
                onClick={(e) => {
                  if (!event.link) {
                    e.preventDefault()
                  }
                }}
              >
                  <div className={styles.eventTop}>
                    <div className={styles.eventHeader}>
                      <span className={styles.eventDateTime}>
                        {formatDateRange(event.date, event.endDate, event.day)}, {event.time}
                      </span>
                    </div>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                  </div>
                  
                  <div className={styles.eventBottom}>
                    <p className={styles.eventInfo}>
                      {event.location} <span className={styles.separator}>•</span> {formatPriceDisplay(event.price)}
                    </p>
                    
                    <div className={styles.eventTags}>
                      {event.tags.map((tag) => {
                        const category = getCategoryByName(tag)
                        if (!category) return null
                        const Icon = category.icon
                        return (
                          <span 
                            key={tag}
                            className={styles.eventTag}
                            data-category={tag}
                          >
                            <Icon size={10} strokeWidth={2} />
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                  </div>
              </a>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

