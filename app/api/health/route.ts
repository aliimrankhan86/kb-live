import { NextResponse } from 'next/server'
import { prisma } from '@/lib/api/db/prisma'

// Lightweight DB ping — used by Vercel cron every 3 days to prevent
// Supabase free-tier auto-pause (pauses after ~7 days inactivity).
// Migrate to Supabase Pro when first paying operator onboards.
export async function GET() {
  let db: 'ok' | 'error' = 'error'
  let dbError: string | undefined

  try {
    await prisma.$queryRaw`SELECT 1`
    db = 'ok'
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err)
  }

  const status = db === 'ok' ? 'healthy' : 'degraded'
  return NextResponse.json(
    { status, db, ...(dbError && { dbError }), timestamp: new Date().toISOString() },
    { status: db === 'ok' ? 200 : 503 },
  )
}
