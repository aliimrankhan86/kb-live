/**
 * LOCAL TEST DATA ONLY. Seeds a local Supabase/Postgres stack with labelled
 * test operators + packages for QA (search, compare, enquiry, alignment).
 *
 *   node scripts/seed-local-test-data.mjs          # upsert seed set
 *   node scripts/seed-local-test-data.mjs --reset  # remove seed set first
 *
 * Refuses to run unless every database/Supabase URL points at localhost or
 * 127.0.0.1 and NODE_ENV is not production. Every row is labelled
 * "[LOCAL TEST DATA]" and every id starts with "local-test-" so it can never be
 * mistaken for (or merged with) real operator data. Operator names, ATOL
 * numbers and hotel names are deliberately fictional placeholders.
 */
import { config } from 'dotenv';
import pg from 'pg';
import { pathToFileURL } from 'node:url';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Throws unless the environment can only reach a local database. */
export function assertLocalOnly(env) {
  if (env.NODE_ENV === 'production') throw new Error('Refusing to seed: NODE_ENV=production');
  const keys = ['DIRECT_URL', 'DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'];
  for (const key of keys) {
    const value = env[key];
    if (!value) throw new Error(`Refusing to seed: ${key} is not set`);
    let host;
    try {
      host = new URL(value).hostname;
    } catch {
      throw new Error(`Refusing to seed: ${key} is not a valid URL`);
    }
    if (!LOCAL_HOSTS.has(host)) throw new Error(`Refusing to seed: ${key} host is not local`);
  }
}

const LABEL = '[LOCAL TEST DATA]';
const OPERATOR_TEST_USER_EMAIL = 'operator@test.local';

const OPERATORS = [
  { key: 'a', companyName: 'Local Test Operator A', slug: 'local-test-operator-a', verification: 'verified', atol: 'TEST-0001', airports: ['LHR', 'LGW', 'BHX'] },
  { key: 'b', companyName: 'Local Test Operator B', slug: 'local-test-operator-b', verification: 'verified', atol: 'TEST-0002', airports: ['MAN', 'BHX', 'STN'] },
  { key: 'c', companyName: 'Local Test Operator C', slug: 'local-test-operator-c', verification: 'verified', atol: null, airports: ['LHR'] },
  // Unverified: its published package must never appear publicly.
  { key: 'd', companyName: 'Local Test Operator D (pending)', slug: 'local-test-operator-d', verification: 'pending', atol: null, airports: ['BHX'] },
];

const allIncl = { visa: true, flights: true, transfers: true, meals: false };
const rooms = { single: false, double: true, triple: true, quad: true };

// n, operator, overrides. Fields left out = not stated by the operator.
const PACKAGES = [
  { n: 1, op: 'a', title: '10 night Umrah from London Heathrow', departureAirport: 'LHR', price: 1495, priceType: 'from', dateWindow: { start: '2026-12-18', end: '2026-12-28' }, seasonLabel: 'Christmas holidays', totalNights: 10, nightsMakkah: 5, nightsMadinah: 5, hotelMakkahStars: 4, hotelMadinahStars: 4, hotelMakkahName: 'Test Hotel Makkah One', hotelMadinahName: 'Test Hotel Madinah One', distanceToHaramMakkahMetres: 350, distanceBandMakkah: 'near', distanceBandMadinah: 'medium', flightType: 'direct', airline: 'Test Airline', groupType: 'small-group', cancellationPolicy: 'Test policy: deposit non-refundable within 30 days of departure.', paymentPlanAvailable: true, depositAmount: 300, ziyaratIncluded: true, ziyaratDetails: 'Test ziyarat text', inclusions: allIncl },
  { n: 2, op: 'a', title: '14 night family Umrah from Birmingham', departureAirport: 'BHX', price: 1550, priceType: 'from', dateWindow: { start: '2026-12-20', end: '2027-01-03' }, seasonLabel: 'School Holidays', totalNights: 14, nightsMakkah: 7, nightsMadinah: 7, hotelMakkahStars: 4, hotelMadinahStars: 3, hotelMakkahName: 'Test Hotel Makkah Two', hotelMadinahName: 'Test Hotel Madinah Two', distanceToHaramMakkahMetres: 800, distanceBandMakkah: 'medium', distanceBandMadinah: 'near', flightType: 'one-stop', groupType: 'large-group', cancellationPolicy: 'Test policy: full refund up to 60 days before departure.', paymentPlanAvailable: true, depositAmount: 250, inclusions: allIncl },
  { n: 3, op: 'b', title: '7 night budget Umrah from Manchester', departureAirport: 'MAN', price: 899, priceType: 'exact', dateWindow: { start: '2027-01-15', end: '2027-01-22' }, totalNights: 7, nightsMakkah: 4, nightsMadinah: 3, hotelMakkahStars: 3, hotelMadinahStars: 3, distanceBandMakkah: 'far', distanceBandMadinah: 'medium', flightType: 'one-stop', groupType: 'large-group', cancellationPolicy: 'Test policy: non-refundable once visa issued.', inclusions: { visa: true, flights: true, transfers: true, meals: false } },
  // Deliberately incomplete: no hotel names/stars, no distance, no group type, no cancellation.
  { n: 4, op: 'b', title: '10 night Umrah from Birmingham (details pending)', departureAirport: 'BHX', price: 1200, priceType: 'from', dateWindow: { start: '2026-12-10', end: '2026-12-20' }, totalNights: 10, nightsMakkah: 5, nightsMadinah: 5, distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown', inclusions: { visa: true, flights: true, transfers: null, meals: null } },
  { n: 5, op: 'c', title: '5 star Ramadan Umrah from London', departureAirport: 'LHR', price: 2950, priceType: 'from', dateWindow: { start: '2027-02-20', end: '2027-03-05' }, seasonLabel: 'Ramadan', totalNights: 13, nightsMakkah: 8, nightsMadinah: 5, hotelMakkahStars: 5, hotelMadinahStars: 5, hotelMakkahName: 'Test Hotel Makkah Five', hotelMadinahName: 'Test Hotel Madinah Five', distanceToHaramMakkahMetres: 100, distanceToHaramMadinahMetres: 150, distanceBandMakkah: 'near', distanceBandMadinah: 'near', flightType: 'direct', airline: 'Test Airline', groupType: 'private', cancellationPolicy: 'Test policy: 50% refund up to 45 days before departure.', paymentPlanAvailable: false, depositAmount: 750, ziyaratIncluded: false, inclusions: { visa: true, flights: true, transfers: true, meals: true } },
  // Deliberately incomplete: free-text airport as an operator might type it, no cancellation.
  { n: 6, op: 'b', title: '12 night Umrah from London Stansted', departureAirport: 'London Stansted', price: 1340, priceType: 'from', dateWindow: { start: '2027-02-01', end: '2027-02-13' }, totalNights: 12, nightsMakkah: 7, nightsMadinah: 5, hotelMakkahStars: 4, hotelMakkahName: 'Test Hotel Makkah Six', distanceBandMakkah: 'medium', distanceBandMadinah: 'unknown', flightType: 'one-stop', groupType: 'small-group', inclusions: allIncl },
  { n: 7, op: 'a', title: 'Shortest 6 night Umrah from Gatwick', departureAirport: 'LGW', price: 1099, priceType: 'from', dateWindow: { start: '2026-11-05', end: '2026-11-11' }, totalNights: 6, nightsMakkah: 4, nightsMadinah: 2, hotelMakkahStars: 4, hotelMadinahStars: 4, hotelMakkahName: 'Test Hotel Makkah Seven', hotelMadinahName: 'Test Hotel Madinah Seven', distanceToHaramMakkahMetres: 500, distanceBandMakkah: 'medium', distanceBandMadinah: 'near', flightType: 'direct', groupType: 'small-group', cancellationPolicy: 'Test policy: refunds per operator terms.', paymentPlanAvailable: false, inclusions: allIncl },
  // Deliberately incomplete: no departure airport stated.
  { n: 8, op: 'b', title: '15 night Umrah, flights not included', price: 980, priceType: 'from', dateWindow: { start: '2027-03-20', end: '2027-04-04' }, seasonLabel: 'Easter', totalNights: 15, nightsMakkah: 8, nightsMadinah: 7, hotelMakkahStars: 3, hotelMadinahStars: 4, hotelMakkahName: 'Test Hotel Makkah Eight', hotelMadinahName: 'Test Hotel Madinah Eight', distanceBandMakkah: 'far', distanceBandMadinah: 'medium', groupType: 'large-group', cancellationPolicy: 'Test policy: deposit refundable within 14 days.', inclusions: { visa: true, flights: false, transfers: true, meals: false } },
  { n: 9, op: 'a', title: '10 night Umrah from Heathrow, January', departureAirport: 'LHR', price: 1250, priceType: 'from', dateWindow: { start: '2027-01-08', end: '2027-01-18' }, totalNights: 10, nightsMakkah: 6, nightsMadinah: 4, hotelMakkahStars: 4, hotelMadinahStars: 4, hotelMakkahName: 'Test Hotel Makkah Nine', hotelMadinahName: 'Test Hotel Madinah Nine', distanceToHaramMakkahMetres: 650, distanceBandMakkah: 'medium', distanceBandMadinah: 'medium', flightType: 'direct', groupType: 'small-group', cancellationPolicy: 'Test policy: 30 day cancellation window.', paymentPlanAvailable: true, depositAmount: 200, inclusions: allIncl },
  { n: 10, op: 'b', title: '21 night extended Umrah from Manchester', departureAirport: 'MAN', price: 2100, priceType: 'from', dateWindow: { start: '2027-01-02', end: '2027-01-23' }, totalNights: 21, nightsMakkah: 12, nightsMadinah: 9, hotelMakkahStars: 4, hotelMadinahStars: 4, hotelMakkahName: 'Test Hotel Makkah Ten', hotelMadinahName: 'Test Hotel Madinah Ten', distanceBandMakkah: 'near', distanceBandMadinah: 'near', flightType: 'one-stop', groupType: 'small-group', cancellationPolicy: 'Test policy: full refund up to 90 days.', paymentPlanAvailable: true, inclusions: allIncl },
  // Deliberately incomplete: Madinah hotel unknown, no group type.
  { n: 11, op: 'c', title: '9 night Umrah from Heathrow, December', departureAirport: 'LHR', price: 1650, priceType: 'exact', dateWindow: { start: '2026-12-02', end: '2026-12-11' }, totalNights: 9, nightsMakkah: 5, nightsMadinah: 4, hotelMakkahStars: 5, hotelMakkahName: 'Test Hotel Makkah Eleven', distanceToHaramMakkahMetres: 200, distanceBandMakkah: 'near', distanceBandMadinah: 'unknown', flightType: 'direct', cancellationPolicy: 'Test policy: non-refundable.', inclusions: allIncl },
  { n: 12, op: 'a', title: 'Hajj 2027 package from London', pilgrimageType: 'hajj', departureAirport: 'LHR', price: 7950, priceType: 'from', dateWindow: { start: '2027-05-10', end: '2027-05-30' }, seasonLabel: 'Hajj', totalNights: 20, nightsMakkah: 14, nightsMadinah: 6, hotelMakkahStars: 4, hotelMadinahStars: 4, hotelMakkahName: 'Test Hotel Makkah Twelve', hotelMadinahName: 'Test Hotel Madinah Twelve', distanceBandMakkah: 'medium', distanceBandMadinah: 'near', flightType: 'direct', groupType: 'large-group', cancellationPolicy: 'Test policy: Hajj terms per operator.', inclusions: { visa: true, flights: true, transfers: true, meals: true } },
  { n: 13, op: 'b', title: '8 night Umrah from Birmingham, February', departureAirport: 'BHX', price: 1180, priceType: 'from', dateWindow: { start: '2027-02-10', end: '2027-02-18' }, totalNights: 8, nightsMakkah: 4, nightsMadinah: 4, hotelMakkahStars: 3, hotelMadinahStars: 3, hotelMakkahName: 'Test Hotel Makkah Thirteen', hotelMadinahName: 'Test Hotel Madinah Thirteen', distanceToHaramMakkahMetres: 1100, distanceBandMakkah: 'medium', distanceBandMadinah: 'medium', flightType: 'direct', groupType: 'private', cancellationPolicy: 'Test policy: 21 day window.', paymentPlanAvailable: true, depositAmount: 150, inclusions: allIncl },
  // Published but from an UNVERIFIED operator: must never appear publicly.
  { n: 15, op: 'd', title: 'Package from an unverified operator', departureAirport: 'BHX', price: 1111, priceType: 'from', dateWindow: { start: '2026-12-05', end: '2026-12-15' }, totalNights: 10, nightsMakkah: 5, nightsMadinah: 5, distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown', inclusions: allIncl },
  // Published, but the departure has passed: must leave every public list (batch 1 item 8).
  { n: 16, op: 'b', title: '10 night summer Umrah from Heathrow, August 2026', departed: true, departureAirport: 'LHR', price: 1450, priceType: 'from', dateWindow: { start: '2026-08-20', end: '2026-08-30' }, seasonLabel: 'Summer holidays', totalNights: 10, nightsMakkah: 5, nightsMadinah: 5, hotelMakkahStars: 4, hotelMadinahStars: 4, distanceBandMakkah: 'near', distanceBandMadinah: 'medium', flightType: 'direct', inclusions: allIncl },
  // Draft: must never appear publicly.
  { n: 14, op: 'a', title: 'Draft package (must not be public)', status: 'draft', departureAirport: 'LHR', price: 999, priceType: 'from', totalNights: 7, nightsMakkah: 4, nightsMadinah: 3, distanceBandMakkah: 'unknown', distanceBandMadinah: 'unknown', inclusions: allIncl },
];

const pkgId = (n) => `local-test-pkg-${String(n).padStart(2, '0')}`;

// A start date before today hides a package (lib/listing.ts hasDeparted), so
// the seeded departures roll forward by whole years once the earliest one
// (5 Nov 2026) is reached. Months stay the same. Package 16 stays in the past.
const today = new Date().toISOString().slice(0, 10);
let yearsAhead = 0;
while (`${2026 + yearsAhead}-11-05` <= today) yearsAhead += 1;
const rollYear = (d) => `${Number(d.slice(0, 4)) + yearsAhead}${d.slice(4)}`;
const seededWindow = (p) =>
  p.departed ? p.dateWindow : { start: rollYear(p.dateWindow.start), end: rollYear(p.dateWindow.end) };

// 1x1 PNG, generated locally. Public URL is stored on package 01.
const TEST_IMAGE_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function uploadTestImage() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set (local stack key from `supabase status`)');
  const path = 'package-images/local-test/pkg01.png';
  const res = await fetch(`${base}/storage/v1/object/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'content-type': 'image/png', 'x-upsert': 'true' },
    body: Buffer.from(TEST_IMAGE_PNG, 'base64'),
  });
  if (!res.ok) throw new Error(`Test image upload failed: ${res.status}`);
  return `${base}/storage/v1/object/public/${path}`;
}

async function main() {
  config({ path: '.env.local', quiet: true });
  assertLocalOnly(process.env);

  const client = new pg.Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  try {
    await client.query('BEGIN');

    const auth = await client.query('select id from auth.users where email = $1', [OPERATOR_TEST_USER_EMAIL]);
    if (auth.rowCount === 0) throw new Error(`${OPERATOR_TEST_USER_EMAIL} missing: run node scripts/create-test-users.mjs first`);
    const userIds = { a: auth.rows[0].id, b: 'local-test-user-operator-b', c: 'local-test-user-operator-c', d: 'local-test-user-operator-d' };

    if (process.argv.includes('--reset')) {
      // Rows created by browsing/enquiring against the test data first (FKs).
      const testOperators = Object.values(userIds);
      await client.query(`delete from analytics_events where operator_id = any($1) or package_id like 'local-test-%'`, [testOperators]);
      await client.query(`delete from enquiries where package_id like 'local-test-%'`);
      await client.query(`delete from packages where id like 'local-test-%' or operator_id = any($1)`, [testOperators]);
      await client.query(`delete from operator_profiles where slug like 'local-test-%'`);
      await client.query(`delete from users where id like 'local-test-%'`);
    }

    for (const op of OPERATORS) {
      const id = userIds[op.key];
      const email = op.key === 'a' ? OPERATOR_TEST_USER_EMAIL : `local-test-operator-${op.key}@test.local`;
      await client.query(
        `insert into users (id, email, role, name, updated_at) values ($1, $2, 'operator', $3, now())
         on conflict (id) do update set role = 'operator', name = excluded.name, updated_at = now()`,
        [id, email, `${op.companyName} ${LABEL}`]
      );
      await client.query(
        `insert into operator_profiles (id, company_name, slug, verification_status, verified_at, atol_number, contact_email,
           departure_airports, pilgrimage_types_offered, serving_regions, onboarding_complete, updated_at)
         values ($1, $2, $3, $4, now(), $5, $6, $7, '{umrah,hajj}', '{UK}', true, now())
         on conflict (id) do update set company_name = excluded.company_name, slug = excluded.slug,
           verification_status = excluded.verification_status, atol_number = excluded.atol_number,
           departure_airports = excluded.departure_airports, updated_at = now()`,
        [id, op.companyName, op.slug, op.verification, op.atol, email, op.airports]
      );
    }

    for (const p of PACKAGES) {
      await client.query(
        `insert into packages (id, operator_id, title, slug, status, pilgrimage_type, season_label, date_window, price_type,
           price_per_person, currency, total_nights, nights_makkah, nights_madinah, hotel_makkah_stars, hotel_madinah_stars,
           hotel_makkah_name, hotel_madinah_name, distance_to_haram_makkah_metres, distance_to_haram_madinah_metres,
           distance_band_makkah, distance_band_madinah, airline, departure_airport, flight_type, deposit_amount,
           payment_plan_available, cancellation_policy, highlights, group_type, ziyarat_included, ziyarat_details,
           room_occupancy_options, inclusions, notes, images, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'GBP',$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,'{}',$28,$29,$30,$31,$32,$33,'{}',now())
         on conflict (id) do update set title = excluded.title, status = excluded.status, season_label = excluded.season_label,
           date_window = excluded.date_window, price_per_person = excluded.price_per_person, departure_airport = excluded.departure_airport,
           updated_at = now()`,
        [
          pkgId(p.n), userIds[p.op], `${p.title} ${LABEL}`, `local-test-${String(p.n).padStart(2, '0')}`,
          p.status ?? 'published', p.pilgrimageType ?? 'umrah', p.seasonLabel ?? null,
          p.dateWindow ? JSON.stringify(seededWindow(p)) : null, p.priceType, p.price,
          p.totalNights, p.nightsMakkah, p.nightsMadinah, p.hotelMakkahStars ?? null, p.hotelMadinahStars ?? null,
          p.hotelMakkahName ?? null, p.hotelMadinahName ?? null, p.distanceToHaramMakkahMetres ?? null,
          p.distanceToHaramMadinahMetres ?? null, p.distanceBandMakkah, p.distanceBandMadinah, p.airline ?? null,
          p.departureAirport ?? null, p.flightType ?? null, p.depositAmount ?? null, p.paymentPlanAvailable ?? null,
          p.cancellationPolicy ?? null, p.groupType ?? null, p.ziyaratIncluded ?? null, p.ziyaratDetails ?? null,
          JSON.stringify(rooms), JSON.stringify(p.inclusions), `${LABEL} Seeded by scripts/seed-local-test-data.mjs`,
        ]
      );
    }

    // Package 01 carries one uploaded image so the image CSP path is tested
    // end to end (Supabase Storage -> next/image -> browser).
    await client.query('update packages set images = $1 where id = $2', [[await uploadTestImage()], pkgId(1)]);

    await client.query('COMMIT');
    console.log(`Seeded ${OPERATORS.length} operators and ${PACKAGES.length} packages ${LABEL}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
