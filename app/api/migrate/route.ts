import { NextResponse } from 'next/server'
import { migrateToKV } from '@/lib/kv-storage'

// This endpoint migrates your local events to Vercel KV
// Call it once after setting up KV: GET /api/migrate
export async function GET() {
  try {
    await migrateToKV()
    return NextResponse.json({ 
      success: true, 
      message: 'Events migrated to Vercel KV successfully!' 
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json(
      { error: 'Failed to migrate events', details: String(error) },
      { status: 500 }
    )
  }
}

