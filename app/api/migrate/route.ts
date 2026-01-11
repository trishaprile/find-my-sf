import { NextResponse } from 'next/server'
import { migrateToRedis } from '@/lib/kv-storage'

// This endpoint migrates your local events to Redis
// Call it once after setting up Redis: GET /api/migrate
export async function GET() {
  try {
    await migrateToRedis()
    return NextResponse.json({ 
      success: true, 
      message: 'Events migrated to Redis successfully!' 
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { error: 'Failed to migrate events', details: String(error) },
      { status: 500 }
    )
  }
}

