'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { Event } from '@/types/event'
import { Trash2, Pencil, Plus } from 'lucide-react'
import { CATEGORY_NAMES } from '@/lib/categories'
import { 
  parseDateToInput, 
  calculateDayFromDate, 
  formatDateDisplay, 
  calculateDayFromDisplayDate, 
  formatPriceDisplay, 
  sortEventsByDate,
  filterPastEvents
} from '@/lib/eventUtils'
import Modal from './Modal'
import styles from './admin.module.css'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [timeValue, setTimeValue] = useState('')
  const [timePeriod, setTimePeriod] = useState('PM')
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    price: '',
    tags: [],
    link: ''
  })

  useEffect(() => {
    // Check if already authenticated in this session
    const authStatus = sessionStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [isAuthenticated])

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (password === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
    setPassword('')
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(sortEventsByDate(data.events || []))
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      endDate: '',
      time: '',
      location: '',
      price: '',
      tags: [],
      link: ''
    })
    setTimeValue('')
    setTimePeriod('PM')
    setEditingEvent(null)
    setShowModal(false)
  }

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title) {
      alert('Event title is required.')
      return
    }
    if (!formData.date) {
      alert('Start date is required.')
      return
    }
    if (!formData.location) {
      alert('Location is required.')
      return
    }
    if (!formData.link) {
      alert('Event link is required.')
      return
    }
    if (!timeValue || !timeValue.trim()) {
      alert('Time is required.')
      return
    }

    setLoading(true)
    try {
      // Combine time and period
      const combinedTime = timeValue ? `${timeValue} ${timePeriod}` : ''
      
      const eventToSave = {
        ...formData,
        id: editingEvent?.id || `event-${Date.now()}`,
        day: calculateDayFromDate(formData.date || ''),
        date: formatDateDisplay(formData.date || ''),
        endDate: formData.endDate ? formatDateDisplay(formData.endDate) : undefined,
        time: combinedTime,
        price: formData.price ? `From $${formData.price}` : 'Free',
        tags: formData.tags || []
      }

      const url = '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSave)
      })

      if (response.ok) {
        alert(`Event ${editingEvent ? 'updated' : 'added'} successfully!`)
        resetForm()
        fetchEvents()
      } else {
        const data = await response.json()
        alert(`Failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event')
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Event deleted successfully!')
        fetchEvents()
      } else {
        const data = await response.json()
        alert(`Failed to delete: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event')
    } finally {
      setLoading(false)
    }
  }

  const cleanupPastEvents = async () => {
    const pastEvents = filterPastEvents(events)
    
    if (pastEvents.length === 0) {
      alert('No past events to clean up!')
      return
    }
    
    if (!confirm(`This will delete ${pastEvents.length} past event(s). Continue?`)) return
    
    setLoading(true)
    try {
      // Delete all past events
      const deletePromises = pastEvents.map(event => 
        fetch(`/api/events?id=${event.id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      alert(`Successfully deleted ${pastEvents.length} past event(s)!`)
      fetchEvents()
    } catch (error) {
      console.error('Error cleaning up past events:', error)
      alert('Error cleaning up past events')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (event: Event) => {
    setEditingEvent(event)
    
    // Parse time into value and period
    const timeParts = event.time?.match(/^(.+?)\s+(AM|PM)$/i)
    if (timeParts) {
      setTimeValue(timeParts[1])
      setTimePeriod(timeParts[2].toUpperCase())
    } else {
      setTimeValue(event.time || '')
      setTimePeriod('PM')
    }
    
    setFormData({
      title: event.title,
      date: parseDateToInput(event.date), // Convert display format to input format
      endDate: event.endDate ? parseDateToInput(event.endDate) : '',
      time: event.time,
      location: event.location,
      price: event.price?.replace(/[^0-9.]/g, '') || '',
      tags: event.tags,
      link: event.link || ''
    })
    setShowModal(true)
  }

  const handleCategoryToggle = (category: string) => {
    const currentTags = formData.tags || []
    setFormData({
      ...formData,
      tags: currentTags.includes(category) 
        ? currentTags.filter(t => t !== category)
        : [...currentTags, category]
    })
  }

  const updateFormField = (field: keyof Event) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={styles.input}
                autoFocus
              />
            </div>
            {authError && <p className={styles.errorMessage}>{authError}</p>}
            <button type="submit" className={styles.loginButton}>
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Event Manager</h1>
        <div className={styles.headerButtons}>
          <button
            onClick={openAddModal}
            className={styles.addButton}
          >
            <Plus size={20} />
            Add Event
          </button>
          <button
            onClick={cleanupPastEvents}
            className={styles.cleanupButton}
            disabled={loading}
          >
            <Trash2 size={18} />
            Clean Up Past Events
          </button>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </div>

      <Modal show={showModal} onClose={resetForm}>
        <form onSubmit={handleSubmit}>
          <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
          
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={updateFormField('date')}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={updateFormField('endDate')}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Time *</label>
              <div className={styles.timeInputGroup}>
                <input
                  type="text"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  placeholder="7:00"
                  className={`${styles.input} ${styles.timeInput}`}
                  required
                />
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className={`${styles.input} ${styles.timePeriodSelect}`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.locationPriceRow}`}>
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Venue name"
                  className={styles.input}
                  required
                />
              </div>  
              <div className={styles.formGroup}>
                <label>Price ($)</label>
                <input
                  type="number"
                  value={formData.price?.replace(/[^0-9.]/g, '') || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  className={styles.input}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

          <div className={styles.formGroup}>
            <label>Categories</label>
            <div className={styles.categoryCheckboxes}>
              {CATEGORY_NAMES.map(cat => (
                <label key={cat} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={(formData.tags || []).includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Event Link *</label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
            </button>
            <button type="button" onClick={resetForm} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {loading && <p className={styles.loadingState}>Loading events...</p>}

      <div className={styles.eventsGrid}>
        {events.length === 0 && !loading && (
          <p className={styles.emptyState}>
            No events yet. Add your first event using the button above!
          </p>
        )}

        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventInfo}>
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.eventLink}
                >
                  <h3>{event.title}</h3>
                </a>
              )}
              <div className={styles.eventMeta}>
                <span>
                  {event.endDate 
                    ? `${event.day} ${event.date} - ${calculateDayFromDisplayDate(event.endDate)} ${event.endDate}` 
                    : `${event.day} ${event.date}`}
                </span>
                <span>{event.time}</span>
                <span>{event.location}</span>
                <span>{formatPriceDisplay(event.price)}</span>
              </div>
              <div className={styles.eventFooter}>
                <div className={styles.eventTags}>
                  {event.tags.map(tag => (
                    <span key={tag} className={styles.eventTag}>{tag}</span>
                  ))}
                </div>
                <div className={styles.eventActions}>
                  <button
                    onClick={() => startEdit(event)}
                    className={styles.editButton}
                    title="Edit event"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className={styles.deleteButton}
                    title="Delete event"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

