/**
 * STAGING ONLY. Seeds the fictional dataset (scripts/seed-staging-data.mjs)
 * into the staging Supabase project. See docs/STAGING.md.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co npm run seed:staging -- --ref <ref>
 *
 * Guards: refuses unless NEXT_PUBLIC_SUPABASE_URL contains --ref, and always
 * refuses the production project. Loads no .env file. The service role key
 * comes from the Supabase CLI at runtime and the database password from the
 * macOS Keychain (service "pilgrimcompare-staging-db"), never from files.
 *
 * Additive and idempotent: inserts only rows that are missing and never
 * deletes, overwrites or resets a row. The one write to an existing row fills
 * a seed package's empty room price columns, and only while its operator notes
 * still state those prices. Sign-in accounts are created when missing and an
 * existing one is never changed (one without app_metadata.seed_batch is refused).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { crc32, deflateSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import {
  ACCOUNTS, COMPLAINTS, ENQUIRIES, IMAGES, LEADS, OPERATORS, PACKAGES,
  SEED_BATCH, roomPriceNote, seedId,
} from './seed-staging-data.mjs';

export const PRODUCTION_REF = 'nzvepuzzxjoxvpcrlozx';
export const ACCOUNTS_FILE = 'staging-seed.config.local.json';
const KEYCHAIN_SERVICE = 'pilgrimcompare-staging-db';
const DEFAULT_POOLER_HOST = 'aws-0-eu-west-1.pooler.supabase.com';
// Must match lib/api/repository.ts (pinned by tests/staging-seed.test.ts).
export const ERASED_NAME = 'Deleted account';
export const RETENTION_ERASED_NAME = 'Removed after 90 days';

/** Throws unless --ref is a staging project ref that NEXT_PUBLIC_SUPABASE_URL also names. */
export function assertStagingTarget(ref, env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  if (ref === PRODUCTION_REF || url.includes(PRODUCTION_REF)) {
    throw new Error('Refusing to seed: that is the production project');
  }
  if (!ref || !/^[a-z0-9]{20}$/.test(ref)) throw new Error('Refusing to seed: pass --ref <staging project ref>');
  if (!url) throw new Error('Refusing to seed: NEXT_PUBLIC_SUPABASE_URL is not set');
  if (!url.includes(ref)) throw new Error('Refusing to seed: NEXT_PUBLIC_SUPABASE_URL does not contain --ref');
}

export function parseArgs(argv) {
  const value = (flag) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  return { ref: value('--ref'), poolerHost: value('--pooler-host') ?? DEFAULT_POOLER_HOST };
}

export const slugify = (n, title) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '')}-${n}`;

const seasonOf = (label) =>
  label === 'Ramadan' ? 'ramadan' : /holidays|Easter/.test(label ?? '') ? 'school_holidays' : 'flexible';

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

/** Generic solid-colour placeholder PNG (no content, no third-party image). */
export function solidPng([r, g, b], width = 640, height = 480) {
  const chunk = (type, body) => {
    const typed = Buffer.concat([Buffer.from(type), body]);
    const out = Buffer.alloc(8 + body.length + 4);
    out.writeUInt32BE(body.length, 0);
    typed.copy(out, 4);
    out.writeUInt32BE(crc32(typed), 8 + body.length);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  const row = Buffer.alloc(1 + width * 3);
  for (let x = 0; x < width; x += 1) row.set([r, g, b], 1 + x * 3);
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

function serviceRoleKey(ref) {
  const out = execFileSync('supabase', ['projects', 'api-keys', '--project-ref', ref, '-o', 'json'], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'],
  });
  const key = JSON.parse(out).find((k) => k.name === 'service_role')?.api_key;
  if (!key) throw new Error('No service_role key returned by the Supabase CLI (run `supabase login`)');
  return key;
}

function databaseUrl(ref, host) {
  const password = execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;
}

/** Account passwords live only in the gitignored ACCOUNTS_FILE, created on first run. */
function loadAccountPasswords() {
  const config = existsSync(ACCOUNTS_FILE) ? JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')) : { accounts: {} };
  let changed = false;
  for (const a of ACCOUNTS) {
    if (config.accounts[a.key]?.password) continue;
    config.accounts[a.key] = { email: a.email, role: a.role, password: `Stg-${randomBytes(12).toString('base64url')}-9a` };
    changed = true;
  }
  if (changed) writeFileSync(ACCOUNTS_FILE, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  return config.accounts;
}

async function ensureAccounts(supabase) {
  const passwords = loadAccountPasswords();
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const ids = {};
  for (const a of ACCOUNTS) {
    const attrs = {
      password: passwords[a.key].password,
      email_confirm: true,
      app_metadata: { role: a.role, seed_batch: SEED_BATCH },
      user_metadata: { name: a.name },
    };
    const existing = data.users.find((u) => u.email === a.email);
    if (existing && existing.app_metadata?.seed_batch !== SEED_BATCH) {
      throw new Error(`${a.email} exists without the seed marker: refusing to use it`);
    }
    if (existing) {
      ids[a.key] = existing.id;
      continue;
    }
    const res = await supabase.auth.admin.createUser({ email: a.email, ...attrs });
    if (res.error) throw res.error;
    ids[a.key] = res.data.user.id;
  }
  return ids;
}

async function uploadImages(baseUrl, key) {
  const urls = {};
  for (const [name, rgb] of Object.entries(IMAGES)) {
    const path = `package-images/staging-seed/${name}.png`;
    const res = await fetch(`${baseUrl}/storage/v1/object/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, apikey: key, 'content-type': 'image/png', 'x-upsert': 'true' },
      body: solidPng(rgb),
    });
    if (!res.ok) throw new Error(`Placeholder image upload failed: ${res.status}`);
    urls[name] = `${baseUrl}/storage/v1/object/public/${path}`;
  }
  return urls;
}

/** Inserts the dataset rows that are missing. Never deletes or resets a row (see the header). */
export async function seedRows(client, accountIds, imageUrls) {
  const accountFor = (opKey) => ACCOUNTS.find((a) => a.operator === opKey);
  const opId = Object.fromEntries(OPERATORS.map((o, i) => [o.key, accountFor(o.key) ? accountIds[accountFor(o.key).key] : seedId('op', i + 1)]));
  const opName = Object.fromEntries(OPERATORS.map((o) => [o.key, o.companyName]));

  const users = [
    ...ACCOUNTS.map((a) => ({ id: accountIds[a.key], email: a.email, role: a.role, name: a.name, consent: a.marketingConsent })),
    ...OPERATORS.filter((o) => !accountFor(o.key)).map((o) => ({
      id: opId[o.key], email: `operator-${o.key.toLowerCase()}@test.local`, role: 'operator', name: o.companyName,
    })),
  ];
  for (const u of users) {
    await client.query(
      `insert into users (id, email, role, name, marketing_consent, marketing_consent_at, marketing_consent_source, updated_at)
       values ($1, $2, $3, $4, $5::boolean, case when $5::boolean is null then null else now() end,
         case when $5::boolean is null then null else 'signup' end, now())
       on conflict do nothing`,
      [u.id, u.email, u.role, u.name, u.consent ?? null],
    );
  }

  for (const o of OPERATORS) {
    const contactEmail = accountFor(o.key)?.email ?? `operator-${o.key.toLowerCase()}@test.local`;
    await client.query(
      `insert into operator_profiles (id, company_name, trading_name, slug, company_registration_number, verification_status,
         verified_at, tier, atol_number, abta_member_number, contact_email, contact_phone, office_address, website_url,
         serving_regions, departure_airports, years_in_business, pilgrimage_types_offered, onboarding_complete, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,true,now())
       on conflict do nothing`,
      [
        opId[o.key], o.companyName, o.tradingName ?? null, o.slug, o.companyNumber ?? null, o.verification,
        o.verification === 'verified' ? daysAgo(30) : null, o.tier, o.atol ?? null, o.abta ?? null, contactEmail,
        o.phone ?? null, o.address ? JSON.stringify(o.address) : null, o.website ?? null, o.regions, o.airports,
        o.years ?? null, o.types,
      ],
    );
  }

  for (const p of PACKAGES) {
    await client.query(
      `insert into packages (id, operator_id, title, slug, status, pilgrimage_type, season_label, date_window, price_type,
         price_per_person, currency, total_nights, nights_makkah, nights_madinah, hotel_makkah_stars, hotel_madinah_stars,
         hotel_makkah_name, hotel_madinah_name, distance_to_haram_makkah_metres, distance_to_haram_madinah_metres,
         distance_band_makkah, distance_band_madinah, airline, departure_airport, flight_type, deposit_amount,
         payment_plan_available, cancellation_policy, highlights, group_type, ziyarat_included, ziyarat_details,
         room_occupancy_options, inclusions, notes, images, created_at, updated_at,
         price_quad_per_person, price_triple_per_person, price_double_per_person)
       values ($1,$2,$3,$4,$5,'umrah',$6,$7,$8,$9,'GBP',$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,
         '{}',$27,$28,$29,$30,$31,$32,$33,$34,$34,$35,$36,$37)
       on conflict (id) do update set
         price_quad_per_person = coalesce(packages.price_quad_per_person, excluded.price_quad_per_person),
         price_triple_per_person = coalesce(packages.price_triple_per_person, excluded.price_triple_per_person),
         price_double_per_person = coalesce(packages.price_double_per_person, excluded.price_double_per_person)
       -- Room prices only, only into empty columns, and only while the notes still state them.
       where packages.notes is not distinct from excluded.notes
         and ((packages.price_quad_per_person is null and excluded.price_quad_per_person is not null)
           or (packages.price_triple_per_person is null and excluded.price_triple_per_person is not null)
           or (packages.price_double_per_person is null and excluded.price_double_per_person is not null))`,
      [
        seedId('pkg', p.n), opId[p.op], p.title, slugify(p.n, p.title), p.status ?? 'published', p.seasonLabel ?? null,
        p.dates ? JSON.stringify({ start: p.dates[0], end: p.dates[1] }) : null, p.priceType ?? 'from', p.price,
        p.nights[0], p.nights[1], p.nights[2], p.stars?.[0] ?? null, p.stars?.[1] ?? null,
        p.hotelMakkahName ?? null, p.hotelMadinahName ?? null, p.metres?.[0] ?? null, p.metres?.[1] ?? null,
        p.bands[0], p.bands[1], p.airline ?? null, p.departureAirport ?? null, p.flightType ?? null, p.deposit ?? null,
        p.plan ?? null, p.cancellation ?? null, p.groupType ?? null, p.ziyarat ?? null, p.ziyaratDetails ?? null,
        JSON.stringify(p.rooms), JSON.stringify(p.inclusions), roomPriceNote(p.roomPrices),
        p.image ? [imageUrls[p.image]] : [], `${p.updated}T09:00:00Z`,
        p.roomPrices?.[0] ?? null, p.roomPrices?.[1] ?? null, p.roomPrices?.[2] ?? null,
      ],
    );
  }

  const pkgById = Object.fromEntries(PACKAGES.map((p) => [p.n, p]));
  for (const e of ENQUIRIES) {
    const p = pkgById[e.pkg];
    const ref = `PC-5EED${String(e.n).padStart(4, '0')}`;
    const live = e.state === 'live';
    const name = live ? e.name : e.state === 'retention' ? RETENTION_ERASED_NAME : ERASED_NAME;
    await client.query(
      `insert into enquiries (id, reference_code, created_at, package_id, operator_id, package_title, operator_name,
         name, email, phone, travel_month, message)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict do nothing`,
      [
        seedId('enq', e.n), ref, daysAgo(e.daysAgo), seedId('pkg', p.n), opId[p.op], p.title, opName[p.op], name,
        live ? e.email ?? null : null, live ? e.phone ?? null : null, live ? e.travelMonth ?? null : null,
        live ? e.message ?? null : null,
      ],
    );
    if (live && e.consent && e.email) {
      await client.query(
        `insert into marketing_consents (id, email, consent, consent_timestamp, source, enquiry_reference, created_at)
         values ($1,$2,true,$3,'enquiry_form',$4,$3) on conflict do nothing`,
        [seedId('mc', e.n), e.email, daysAgo(e.daysAgo), ref],
      );
    }
  }

  const customerId = accountIds.customerWithEnquiries;
  const bookingRef = (n) => `PC-5EEDB${String(n).padStart(3, '0')}`;
  for (const l of LEADS) {
    const p = pkgById[l.pkg];
    const stars = p.stars?.[0] ?? 4;
    await client.query(
      `insert into quote_requests (id, customer_id, status, created_at, type, season, date_window, departure_city,
         total_nights, nights_makkah, nights_madinah, hotel_stars, distance_preference, budget_range, occupancy,
         inclusions, notes, source_operator_id)
       values ($1,$2,$3,$4,'umrah',$5,$6,$7,$8,$9,$10,$11,'near',$12,$13,$14,$15,$16) on conflict do nothing`,
      [
        seedId('qr', l.n), customerId, l.status, daysAgo(l.daysAgo), seasonOf(p.seasonLabel),
        JSON.stringify({ start: p.dates[0], end: p.dates[1], flexible: false }), p.departureAirport ?? null,
        p.nights[0], p.nights[1], p.nights[2], stars,
        JSON.stringify({ min: p.price - 200, max: p.price + 300, currency: 'GBP' }),
        JSON.stringify({ single: 0, double: 2, triple: 0, quad: 0 }),
        JSON.stringify({ visa: true, flights: true, transfers: true, meals: false }),
        `Test lead for "${p.title}"`, opId[l.op],
      ],
    );
    if (!l.offerPrice) continue;
    await client.query(
      `insert into offers (id, request_id, operator_id, created_at, price_per_person, currency, total_nights, nights_makkah,
         nights_madinah, hotel_stars, distance_to_haram, room_occupancy, inclusions, notes)
       values ($1,$2,$3,$4,$5,'GBP',$6,$7,$8,$9,$10,$11,$12,'Test offer') on conflict do nothing`,
      [
        seedId('of', l.n), seedId('qr', l.n), opId[l.op], daysAgo(l.daysAgo - 1), l.offerPrice, p.nights[0], p.nights[1],
        p.nights[2], stars, p.metres?.[0] ? `${p.metres[0]}m` : 'Unknown',
        JSON.stringify({ double: true }), JSON.stringify({ visa: true, flights: true, transfers: true, meals: false }),
      ],
    );
    await client.query(
      `insert into booking_intents (id, reference_code, offer_id, customer_id, operator_id, status, created_at, updated_at, notes)
       values ($1,$2,$3,$4,$5,$6,$7,$7,'Test booking intent') on conflict do nothing`,
      [seedId('bi', l.n), bookingRef(l.n), seedId('of', l.n), customerId, opId[l.op], l.booking, daysAgo(l.daysAgo - 2)],
    );
    if (l.outcome) {
      await client.query(
        `insert into booking_outcomes (id, booking_intent_id, outcome, reported_at, notes) values ($1,$2,$3,now(),'Test outcome') on conflict do nothing`,
        [seedId('bo', l.n), seedId('bi', l.n), l.outcome],
      );
    }
  }

  const leadByN = Object.fromEntries(LEADS.map((l) => [l.n, l]));
  for (const c of COMPLAINTS) {
    const l = leadByN[c.lead];
    await client.query(
      `insert into complaints (id, booking_intent_id, reference_code, customer_id, operator_id, category, severity,
         description, status, operator_response, operator_responded_at, admin_notes, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now()) on conflict do nothing`,
      [
        seedId('cp', c.n), seedId('bi', l.n), bookingRef(l.n), customerId, opId[l.op], c.category, c.severity,
        c.description, c.status, c.operatorResponse ?? null, c.operatorResponse ? daysAgo(1) : null,
        c.adminNotes ?? null, daysAgo(l.daysAgo - 3),
      ],
    );
  }
}

async function main() {
  const { ref, poolerHost } = parseArgs(process.argv.slice(2));
  assertStagingTarget(ref, process.env);
  const baseUrl = `https://${ref}.supabase.co`;
  const key = serviceRoleKey(ref);
  const supabase = createClient(baseUrl, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const accountIds = await ensureAccounts(supabase);
  const imageUrls = await uploadImages(baseUrl, key);

  // Supabase Root 2021 CA (public certificate published by Supabase) verifies the pooler's TLS certificate.
  const client = new pg.Client({ connectionString: databaseUrl(ref, poolerHost), ssl: { ca: readFileSync(new URL('./supabase-root-2021-ca.crt', import.meta.url), 'utf8') } });
  await client.connect();
  try {
    await client.query('BEGIN');
    await seedRows(client, accountIds, imageUrls);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
  console.log(
    `Seeded staging ${ref}: ${ACCOUNTS.length} accounts, ${OPERATORS.length} operators, ${PACKAGES.length} packages, ` +
      `${ENQUIRIES.length} enquiries, ${LEADS.length} leads, ${COMPLAINTS.length} complaints.`,
  );
  console.log(`Accounts: ${ACCOUNTS.map((a) => a.email).join(', ')}. Passwords: ${ACCOUNTS_FILE} (local, gitignored).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
