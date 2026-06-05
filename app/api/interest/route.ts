import { NextRequest, NextResponse } from 'next/server'
import { MockDB } from '@/lib/api/mock-db'

const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type } = body

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Enter a valid email address' },
        { status: 400 }
      )
    }

    if (!type || (type !== 'hajj' && type !== 'umrah')) {
      return NextResponse.json(
        { error: 'Invalid interest type' },
        { status: 400 }
      )
    }

    const dedupeKey = request.headers.get('x-dedupe-key')
    if (!dedupeKey) {
      return NextResponse.json(
        { error: 'Missing deduplication key' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim()

    // Server-side deduplication: skip if same email+type already exists
    const existing = MockDB.getInterests().find(
      (i) => i.email.toLowerCase() === trimmedEmail.toLowerCase() && i.type === type
    )
    if (existing) {
      return NextResponse.json(
        { message: 'You are already on the list. We will notify you when packages are available.', email: trimmedEmail, type },
        { status: 200 }
      )
    }

    MockDB.saveInterest(trimmedEmail, type)

    return NextResponse.json(
      { message: 'Interest registered successfully', email: trimmedEmail, type },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Unable to process your request right now. Please try again later.' },
      { status: 500 }
    )
  }
}