import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { config } from 'dotenv'
import pg from 'pg'

// Batch 3 item 2: npm run seed:staging writes each package's stated room prices
// into the three columns, adds only missing rows and never deletes or resets
// one. LOCAL ONLY, inside one transaction that is rolled back, so the local
// suite's own data is untouched.
config({ path: '.env.local', quiet: true })
const directUrl = process.env.DIRECT_URL!
if (new URL(directUrl).hostname !== '127.0.0.1') throw new Error('DIRECT_URL is not local')

const ROOMS = ['quad', 'triple', 'double'] as const
const column = (room: string) => `price_${room}_per_person`
/** The prices the operator notes state, keyed by room, from the note text itself. */
const stated = (notes: string | null) =>
  Object.fromEntries([...(notes ?? '').matchAll(/(Quad|Triple|Double) £([\d,]+)/g)].map((m) => [m[1].toLowerCase(), Number(m[2].replace(/,/g, ''))]))

test('staging seed fills stated room prices, adds only missing rows and never deletes or resets one', async () => {
  // Dynamic import: Playwright would otherwise compile these ES modules to CommonJS.
  const { seedRows } = await import('../../scripts/seed-staging.mjs')
  const { ACCOUNTS, PACKAGES, seedId } = await import('../../scripts/seed-staging-data.mjs')
  const client = new pg.Client({ connectionString: directUrl })
  await client.connect()
  const q = async (text: string, values: unknown[] = []) => (await client.query(text, values)).rows
  const pkgId = (n: number) => seedId('pkg', n)
  const like = `${seedId('pkg', 1).slice(0, 9)}%` // the 5eed5eed- marker
  const snapshot = async () => ({
    packages: await q(`select * from packages where id::text like $1 order by id`, [like]),
    operators: await q(`select * from operator_profiles where id in (select operator_id from packages where id::text like $1) order by id`, [like]),
    counts: await q(`select (select count(*) from users) u, (select count(*) from operator_profiles) o, (select count(*) from packages) p,
      (select count(*) from enquiries) e, (select count(*) from marketing_consents) m, (select count(*) from quote_requests) r,
      (select count(*) from offers) f, (select count(*) from booking_intents) b, (select count(*) from booking_outcomes) bo,
      (select count(*) from complaints) c, (select count(*) from analytics_events) a`),
  })
  try {
    await client.query('BEGIN')
    const accountIds = Object.fromEntries(ACCOUNTS.map((a) => [a.key, randomUUID()]))
    const images = { p1: 'http://127.0.0.1/p1.png', p2: 'http://127.0.0.1/p2.png' }

    // Staging as batch 2 left it: seeded before migration 015, so no room prices,
    // then touched during UAT.
    await seedRows(client, accountIds, images)
    await q(`update packages set price_quad_per_person = null, price_triple_per_person = null, price_double_per_person = null where id::text like $1`, [like])
    await q(`update packages set price_double_per_person = 1599 where id = $1`, [pkgId(10)]) // set by hand in UAT
    await q(`update packages set notes = 'Edited in UAT' where id = $1`, [pkgId(2)]) // notes no longer state prices
    await q(`update operator_profiles set contact_phone = '07700 900999' where id = (select operator_id from packages where id = $1)`, [pkgId(1)])
    const uatEvent = randomUUID()
    await q(`insert into analytics_events (id, operator_id, event_type, package_id, occurred_at)
      select $1, operator_id, 'package_view', id, now() from packages where id = $2`, [uatEvent, pkgId(1)])
    const before = await snapshot()

    await seedRows(client, accountIds, images)
    const after = await snapshot()

    // Never deletes or adds a row that was already there, and keeps UAT edits.
    expect(after.counts).toEqual(before.counts)
    expect(await q(`select 1 from analytics_events where id = $1`, [uatEvent])).toHaveLength(1)
    expect(after.operators).toEqual(before.operators)
    const strip = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).filter(([k]) => !k.startsWith('price_') || k === 'price_per_person' || k === 'price_type'))
    expect(after.packages.map(strip)).toEqual(before.packages.map(strip))

    // Room prices: exactly the numbers the notes state, the others NULL.
    const rows = Object.fromEntries(after.packages.map((r) => [r.id, r]))
    let filled = 0
    for (const p of PACKAGES) {
      const row = rows[pkgId(p.n)]
      for (const room of ROOMS) {
        const value = row[column(room)] === null ? null : Number(row[column(room)])
        if (p.n === 10 && room === 'double') expect(value, 'hand-set value kept').toBe(1599)
        else if (p.n === 2) expect(value, 'edited notes: left empty').toBeNull()
        else expect(value, `package ${p.n} ${room}`).toBe(stated(row.notes)[room] ?? null)
        if (value !== null) filled++
      }
    }
    expect(filled).toBeGreaterThan(60)
    expect(stated(rows[pkgId(12)].notes)).toEqual({ quad: 799, triple: 849 })
    expect(rows[pkgId(12)].price_double_per_person).toBeNull()

    // Idempotent: a third run changes nothing.
    await seedRows(client, accountIds, images)
    expect(await snapshot()).toEqual(after)
  } finally {
    await client.query('ROLLBACK')
    await client.end()
  }
})
