import { NextResponse } from 'next/server'
import { loadEvents, saveEvents } from '@/lib/kv-storage'
import { Event } from '@/types/event'

// GET all events
export async function GET() {
  try {
    const events = await loadEvents()
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST add a new event
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title) {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      )
    }

    const events = await loadEvents()
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      day: body.day || '',
      date: body.date || '',
      time: body.time || '',
      title: body.title,
      location: body.location || '',
      price: body.price || 'Free',
      tags: body.tags || [],
      link: body.link || ''
    }
    
    events.push(newEvent)
    await saveEvents(events)
    
    return NextResponse.json({ event: newEvent }, { status: 201 })
  } catch (error) {
    console.error('Failed to add event:', error)
    return NextResponse.json(
      { error: 'Failed to add event' },
      { status: 500 }
    )
  }
}

// PUT update an event
export async function PUT(request: Request) {
  try {
    const body: Event = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const events = await loadEvents()
    const index = events.findIndex(e => e.id === body.id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    events[index] = body
    await saveEvents(events)
    
    return NextResponse.json({ event: body })
  } catch (error) {
    console.error('Failed to update event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE remove an event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const events = await loadEvents()
    const filteredEvents = events.filter(e => e.id !== id)
    
    if (events.length === filteredEvents.length) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    await saveEvents(filteredEvents)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

