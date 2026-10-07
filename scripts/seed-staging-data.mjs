/**
 * STAGING SEED DATASET. Fictional only: every operator name starts with
 * "Test", ATOL numbers are 99001 to 99004, hotels, airlines, phone numbers
 * (Ofcom drama ranges), websites (RFC 2606) and people are invented.
 * Every row id starts with SEED_ID_PREFIX, the seed batch marker that
 * scripts/seed-staging.mjs wipes and reseeds. Passwords are NOT here: they
 * live in the gitignored staging-seed.config.local.json (see docs/STAGING.md).
 */
export const SEED_BATCH = 'staging-seed-v1';
// Valid UUIDs (some id columns may be uuid), all starting with the marker.
export const SEED_ID_PREFIX = '5eed5eed-';
const KINDS = { op: 1, pkg: 2, enq: 3, mc: 4, qr: 5, of: 6, bi: 7, bo: 8, cp: 9 };
export const seedId = (kind, n) =>
  `${SEED_ID_PREFIX}${String(KINDS[kind]).padStart(4, '0')}-4000-8000-${String(n).padStart(12, '0')}`;

/** Sign-in accounts (Supabase auth). `operator` links the account to an operator below. */
export const ACCOUNTS = [
  { key: 'admin', email: 'admin@test.local', role: 'admin', name: 'Test Admin' },
  { key: 'operatorA', email: 'operator-a@test.local', role: 'operator', name: 'Test Operator A', operator: 'A' },
  { key: 'operatorB', email: 'operator-b@test.local', role: 'operator', name: 'Test Operator B', operator: 'B' },
  { key: 'operatorE', email: 'operator-e@test.local', role: 'operator', name: 'Test Operator E', operator: 'E' },
  { key: 'customerWithEnquiries', email: 'customer-enquiries@test.local', role: 'customer', name: 'Test Customer One', marketingConsent: true },
  { key: 'customerNew', email: 'customer-new@test.local', role: 'customer', name: 'Test Customer Two', marketingConsent: false },
];

const ADDRESS = (line1, city, postcode) => ({ line1, city, postcode, country: 'United Kingdom' });

/** Operators without an account (C, D, F) get a seed id. Public: verified AND ATOL. */
export const OPERATORS = [
  {
    key: 'A', companyName: 'Test Pilgrim Travel London', tradingName: 'Test Pilgrim Travel', slug: 'test-pilgrim-travel-london',
    verification: 'verified', tier: 'verified', atol: '99001', abta: 'TESTA1', companyNumber: 'TEST0001',
    phone: '020 7946 0001', address: ADDRESS('1 Test Street', 'London', 'TE1 1ST'), website: 'https://example.com',
    years: 12, regions: ['London', 'South East'], airports: ['LHR', 'LGW', 'STN', 'LTN'], types: ['umrah', 'hajj'],
  },
  {
    key: 'B', companyName: 'Test Northern Umrah Services', slug: 'test-northern-umrah-services',
    verification: 'verified', tier: 'verified', atol: '99002', companyNumber: 'TEST0002',
    phone: '0161 496 0001', address: ADDRESS('2 Test Road', 'Manchester', 'TE2 2ND'), website: 'https://example.org',
    years: 6, regions: ['North West', 'West Midlands'], airports: ['MAN', 'BHX'], types: ['umrah'],
  },
  // Minimal profile: most public fields show "Not provided".
  { key: 'C', companyName: 'Test Minimal Tours', slug: 'test-minimal-tours', verification: 'verified', tier: 'verified', atol: '99003', airports: [], regions: [], types: ['umrah'] },
  {
    key: 'D', companyName: 'Test Northern Pilgrimage and Heritage Travel Services Company Limited', slug: 'test-northern-pilgrimage-heritage',
    verification: 'verified', tier: 'verified', atol: '99004', phone: '0113 496 0001', airports: ['LHR', 'MAN', 'STN', 'LGW', 'LTN'], regions: ['Yorkshire'], types: ['umrah'],
  },
  // Must be hidden publicly: pending verification (no ATOL submitted yet).
  { key: 'E', companyName: 'Test Pending Pilgrim Tours', slug: 'test-pending-pilgrim-tours', verification: 'pending', tier: 'listed', atol: null, airports: ['LHR', 'MAN'], regions: [], types: ['umrah'] },
  // Must be hidden publicly: verified but no ATOL number.
  { key: 'F', companyName: 'Test Unlicensed Umrah Agency', slug: 'test-unlicensed-umrah-agency', verification: 'verified', tier: 'verified', atol: null, airports: ['BHX', 'LGW'], regions: [], types: ['umrah'] },
];

const ALL_IN = { visa: true, flights: true, transfers: true, meals: true };
const NO_MEALS = { visa: true, flights: true, transfers: true, meals: false };
const NOT_STATED = { visa: null, flights: null, transfers: null, meals: null };
const QTD = { single: false, double: true, triple: true, quad: true };
const NO_ROOMS = { single: false, double: false, triple: false, quad: false };

// Placeholder images uploaded by the seed (generic solid colour, no content).
export const IMAGES = { p1: [205, 200, 190], p2: [180, 196, 188] };

const h = (code) => ({ hotelMakkahName: `Test Makkah Hotel ${code}`, hotelMadinahName: `Test Madinah Hotel ${code}` });
const LONG_HOTELS = {
  hotelMakkahName: 'Test Grand Residence Makkah Tower Wing Executive Suites and Conference Centre Hotel',
  hotelMadinahName: 'Test Madinah Garden Courtyard Premier Residence and Family Apartments Hotel',
};

/**
 * Packages. `n` makes the id/slug. Fields left out are not stated by the
 * operator and must render as "Not provided". `updated` is the price date.
 * Room prices: the schema holds one price per package (the "from" price for
 * the cheapest room), so the quad/triple/double breakdown is operator-stated
 * text in `notes` (operator-only, not shown publicly).
 *
 * @typedef {object} SeedPackage
 * @property {number} n
 * @property {string} op
 * @property {string} title
 * @property {'draft' | 'published'} [status]
 * @property {string} [departureAirport]
 * @property {number[]} nights total, Makkah, Madinah
 * @property {(number | null)[]} [stars] Makkah, Madinah
 * @property {string} [hotelMakkahName]
 * @property {string} [hotelMadinahName]
 * @property {string[]} bands Makkah, Madinah
 * @property {(number | null)[]} [metres] Makkah, Madinah
 * @property {string[]} [dates] start, end
 * @property {string} [seasonLabel]
 * @property {'from' | 'exact'} [priceType]
 * @property {number} price
 * @property {(number | null)[]} [roomPrices] quad, triple, double
 * @property {Record<string, boolean>} rooms
 * @property {Record<string, boolean | null>} inclusions
 * @property {boolean} [ziyarat]
 * @property {string} [ziyaratDetails]
 * @property {string} [flightType]
 * @property {string} [airline]
 * @property {string} [groupType]
 * @property {string} [cancellation]
 * @property {number} [deposit]
 * @property {boolean} [plan]
 * @property {'p1' | 'p2'} [image]
 * @property {string} updated price date (YYYY-MM-DD)
 */

/** @type {SeedPackage[]} */
export const PACKAGES = [
  // ── Operator A (London) ────────────────────────────────────────────
  { n: 1, op: 'A', title: '10 night Umrah from Heathrow, December', departureAirport: 'LHR', nights: [10, 5, 5], stars: [4, 4], ...h('A1'), bands: ['near', 'near'], metres: [300, 250], dates: ['2026-12-12', '2026-12-22'], seasonLabel: 'Christmas holidays', price: 1295, roomPrices: [1295, 1395, 1595], rooms: QTD, inclusions: ALL_IN, ziyarat: true, ziyaratDetails: 'Guided ziyarat in Makkah and Madinah', flightType: 'direct', airline: 'Test Air', groupType: 'small-group', cancellation: 'Test policy: deposit non-refundable within 30 days of departure.', deposit: 250, plan: true, image: 'p1', updated: '2026-10-01' },
  { n: 2, op: 'A', title: '7 night Umrah from Gatwick, off-peak', departureAirport: 'LGW', nights: [7, 4, 3], stars: [3, 3], ...h('A2'), bands: ['medium', 'medium'], metres: [750, 600], dates: ['2026-11-10', '2026-11-17'], price: 699, roomPrices: [699, 749, 849], rooms: QTD, inclusions: NO_MEALS, ziyarat: false, flightType: 'one-stop', airline: 'Test Air', groupType: 'large-group', cancellation: 'Test policy: full refund up to 45 days before departure.', deposit: 150, plan: false, updated: '2026-09-28' },
  { n: 3, op: 'A', title: '14 night Ramadan Umrah from Heathrow, last ten nights', departureAirport: 'LHR', nights: [14, 10, 4], stars: [5, 5], ...h('A3'), bands: ['near', 'near'], metres: [100, 150], dates: ['2027-02-25', '2027-03-11'], seasonLabel: 'Ramadan', price: 4450, roomPrices: [4450, 4750, 5250], rooms: QTD, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', airline: 'Test Air', groupType: 'private', cancellation: 'Test policy: 50% refund up to 60 days before departure.', deposit: 1000, plan: true, image: 'p2', updated: '2026-10-05' },
  { n: 4, op: 'A', title: '21 night Ramadan Umrah from Heathrow, full month', departureAirport: 'LHR', nights: [21, 14, 7], stars: [5, 5], ...h('A4'), bands: ['near', 'near'], metres: [80, 120], dates: ['2027-02-15', '2027-03-08'], seasonLabel: 'Ramadan', price: 6950, roomPrices: [null, 6950, 7450], rooms: { single: false, double: true, triple: true, quad: false }, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', airline: 'Test Air', groupType: 'private', cancellation: 'Test policy: deposit non-refundable.', deposit: 1500, plan: true, image: 'p1', updated: '2026-10-06' },
  { n: 5, op: 'A', title: '10 night Easter Umrah from Stansted', departureAirport: 'STN', nights: [10, 6, 4], stars: [4, 3], ...h('A5'), bands: ['medium', 'near'], metres: [700, 200], dates: ['2027-03-27', '2027-04-06'], seasonLabel: 'Easter', price: 1595, roomPrices: [1595, 1695, 1895], rooms: QTD, inclusions: { visa: true, flights: true, transfers: true, meals: null }, flightType: 'one-stop', groupType: 'small-group', cancellation: 'Test policy: 30 day cancellation window.', deposit: 300, plan: true, updated: '2026-09-30' },
  { n: 6, op: 'A', title: '14 night summer Umrah from Luton', departureAirport: 'LTN', nights: [14, 7, 7], stars: [4, 4], ...h('A6'), bands: ['far', 'medium'], metres: [1200, null], dates: ['2027-07-24', '2027-08-07'], seasonLabel: 'Summer holidays', price: 2150, roomPrices: [2150, 2295, 2550], rooms: QTD, inclusions: { visa: true, flights: true, transfers: false, meals: false }, ziyarat: true, flightType: 'one-stop', groupType: 'large-group', plan: false, image: 'p2', updated: '2026-10-02' },
  { n: 7, op: 'A', title: '7 night summer Umrah from Heathrow', departureAirport: 'LHR', nights: [7, 4, 3], stars: [4, 4], ...h('A7'), bands: ['near', 'near'], metres: [400, 300], dates: ['2027-08-01', '2027-08-08'], seasonLabel: 'Summer holidays', price: 1895, roomPrices: [1895, 1995, 2195], rooms: QTD, inclusions: NO_MEALS, ziyarat: false, flightType: 'direct', airline: 'Test Air', groupType: 'small-group', cancellation: 'Test policy: refunds per operator terms.', plan: true, deposit: 400, updated: '2026-10-03' },
  // Very long title and hotel names (wrapping, truncation, comparison layout).
  { n: 8, op: 'A', title: '14 night Umrah from Heathrow with an extended Madinah stay, guided ziyarat in both holy cities, airport lounge access and a dedicated group leader throughout the journey', departureAirport: 'LHR', nights: [14, 8, 6], stars: [5, 4], ...LONG_HOTELS, bands: ['near', 'medium'], metres: [250, 650], dates: ['2027-01-12', '2027-01-26'], price: 2795, roomPrices: [2795, 2950, 3250], rooms: QTD, inclusions: ALL_IN, ziyarat: true, ziyaratDetails: 'Guided ziyarat in Makkah and Madinah with a scholar, including Quba, Uhud and the Seven Mosques area', flightType: 'direct', airline: 'Test Air', groupType: 'small-group', cancellation: 'Test policy: full refund up to 90 days before departure, then 50% up to 30 days, then non-refundable.', deposit: 500, plan: true, image: 'p1', updated: '2026-09-25' },
  // Expired: published, but its dates are in the past.
  { n: 9, op: 'A', title: '10 night summer Umrah from Heathrow, August 2026', departureAirport: 'LHR', nights: [10, 5, 5], stars: [4, 4], ...h('A9'), bands: ['near', 'medium'], dates: ['2026-08-20', '2026-08-30'], seasonLabel: 'Summer holidays', price: 1450, roomPrices: [1450, 1550, 1750], rooms: QTD, inclusions: NO_MEALS, flightType: 'direct', updated: '2026-07-15' },

  // ── Operator B (Manchester and Birmingham) ─────────────────────────
  // Same price and price date as package 1: tie sorting.
  { n: 10, op: 'B', title: '10 night Umrah from Manchester, December', departureAirport: 'MAN', nights: [10, 5, 5], stars: [4, 4], ...h('B1'), bands: ['near', 'medium'], metres: [350, 700], dates: ['2026-12-05', '2026-12-15'], price: 1295, roomPrices: [1295, 1395, 1595], rooms: QTD, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', airline: 'Test Air', groupType: 'small-group', cancellation: 'Test policy: deposit non-refundable within 30 days of departure.', deposit: 250, plan: true, image: 'p1', updated: '2026-10-01' },
  { n: 11, op: 'B', title: '14 night family Umrah from Birmingham, Christmas', departureAirport: 'BHX', nights: [14, 7, 7], stars: [4, 3], ...h('B2'), bands: ['medium', 'near'], metres: [800, 300], dates: ['2026-12-19', '2027-01-02'], seasonLabel: 'Christmas holidays', price: 1850, roomPrices: [1850, 1950, 2200], rooms: QTD, inclusions: NO_MEALS, ziyarat: false, flightType: 'one-stop', groupType: 'large-group', cancellation: 'Test policy: full refund up to 60 days before departure.', deposit: 300, plan: true, updated: '2026-09-29' },
  { n: 12, op: 'B', title: '7 night budget Umrah from Manchester, January', departureAirport: 'MAN', nights: [7, 4, 3], stars: [3, 3], ...h('B3'), bands: ['far', 'far'], metres: [1500, 1100], dates: ['2027-01-18', '2027-01-25'], price: 799, roomPrices: [799, 849, null], rooms: { single: false, double: false, triple: true, quad: true }, inclusions: { visa: true, flights: true, transfers: null, meals: false }, flightType: 'one-stop', groupType: 'large-group', plan: false, updated: '2026-09-20' },
  { n: 13, op: 'B', title: '21 night Ramadan Umrah from Manchester', departureAirport: 'MAN', nights: [21, 12, 9], stars: [4, 4], ...h('B4'), bands: ['near', 'near'], metres: [450, 350], dates: ['2027-02-14', '2027-03-07'], seasonLabel: 'Ramadan', price: 3950, roomPrices: [3950, 4150, 4550], rooms: QTD, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', airline: 'Test Air', groupType: 'small-group', cancellation: 'Test policy: 50% refund up to 60 days before departure.', deposit: 750, plan: true, image: 'p2', updated: '2026-10-04' },
  { n: 14, op: 'B', title: '10 night Easter Umrah from Birmingham', departureAirport: 'BHX', nights: [10, 5, 5], stars: [3, 4], ...h('B5'), bands: ['medium', 'near'], metres: [900, 250], dates: ['2027-03-28', '2027-04-07'], seasonLabel: 'Easter', price: 1395, roomPrices: [1395, 1495, 1695], rooms: QTD, inclusions: NO_MEALS, ziyarat: true, flightType: 'one-stop', groupType: 'large-group', plan: true, deposit: 250, updated: '2026-10-02' },
  { n: 15, op: 'B', title: '14 night summer Umrah from Birmingham', departureAirport: 'BHX', nights: [14, 8, 6], stars: [5, 5], ...h('B6'), bands: ['near', 'near'], metres: [150, 200], dates: ['2027-07-31', '2027-08-14'], seasonLabel: 'Summer holidays', price: 3250, roomPrices: [3250, 3450, 3850], rooms: QTD, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', groupType: 'private', cancellation: 'Test policy: deposit non-refundable.', deposit: 600, plan: true, image: 'p1', updated: '2026-10-03' },
  { n: 16, op: 'B', title: '7 night off-peak Umrah from Manchester, May', departureAirport: 'MAN', nights: [7, 4, 3], stars: [4, null], hotelMakkahName: 'Test Makkah Hotel B7', bands: ['medium', 'unknown'], metres: [600, null], dates: ['2027-05-10', '2027-05-17'], price: 1050, roomPrices: [1050, 1150, 1300], rooms: QTD, inclusions: { visa: true, flights: true, transfers: true, meals: null }, flightType: 'one-stop', updated: '2026-09-27' },
  // Draft: must never appear publicly.
  { n: 17, op: 'B', status: 'draft', title: '10 night Umrah from Manchester, draft', departureAirport: 'MAN', nights: [10, 5, 5], stars: [4, 4], ...h('B8'), bands: ['near', 'near'], dates: ['2027-01-05', '2027-01-15'], price: 1199, roomPrices: [1199, 1299, 1499], rooms: QTD, inclusions: NO_MEALS, updated: '2026-10-06' },

  // ── Operator C (minimal profile) ───────────────────────────────────
  { n: 18, op: 'C', title: '10 night Umrah from Heathrow', departureAirport: 'LHR', nights: [10, 5, 5], bands: ['unknown', 'unknown'], dates: ['2027-01-08', '2027-01-18'], price: 1150, roomPrices: [1150, null, null], rooms: QTD, inclusions: { visa: true, flights: true, transfers: null, meals: null }, updated: '2026-09-22' },
  { n: 19, op: 'C', title: '7 night Umrah from Gatwick', departureAirport: 'LGW', nights: [7, 4, 3], stars: [3, null], hotelMakkahName: 'Test Makkah Hotel C2', bands: ['medium', 'unknown'], dates: ['2026-11-20', '2026-11-27'], price: 749, roomPrices: [749, 799, 899], rooms: QTD, inclusions: { visa: true, flights: true, transfers: true, meals: null }, updated: '2026-09-18' },
  // Every optional field empty (only what the schema requires).
  { n: 20, op: 'C', title: '10 night Umrah', nights: [10, 5, 5], bands: ['unknown', 'unknown'], price: 999, rooms: NO_ROOMS, inclusions: NOT_STATED, updated: '2026-09-15' },
  // No departure airport stated (other fields present).
  { n: 21, op: 'C', title: '14 night Umrah, departure airport not stated', nights: [14, 7, 7], stars: [4, 4], ...h('C4'), bands: ['medium', 'medium'], dates: ['2027-01-15', '2027-01-29'], price: 1695, roomPrices: [1695, 1795, 1995], rooms: QTD, inclusions: { visa: true, flights: false, transfers: true, meals: false }, groupType: 'small-group', updated: '2026-09-26' },
  // Single price only: one room type, exact price.
  { n: 22, op: 'C', title: '10 night Easter Umrah from Luton', departureAirport: 'LTN', nights: [10, 5, 5], stars: [3, 3], ...h('C5'), bands: ['far', 'medium'], dates: ['2027-03-26', '2027-04-05'], seasonLabel: 'Easter', priceType: 'exact', price: 1240, rooms: { single: false, double: true, triple: false, quad: false }, inclusions: NO_MEALS, updated: '2026-10-01' },
  { n: 23, op: 'C', title: '21 night Umrah from Stansted, December', departureAirport: 'STN', nights: [21, 11, 10], stars: [4, null], hotelMakkahName: 'Test Makkah Hotel C6', bands: ['near', 'unknown'], dates: ['2026-12-01', '2026-12-22'], price: 2450, roomPrices: [2450, 2600, 2900], rooms: QTD, inclusions: NO_MEALS, updated: '2026-09-30' },
  { n: 24, op: 'C', title: '7 night Ramadan Umrah from Birmingham', departureAirport: 'BHX', nights: [7, 4, 3], bands: ['unknown', 'unknown'], dates: ['2027-03-01', '2027-03-08'], seasonLabel: 'Ramadan', price: 1750, roomPrices: [1750, null, null], rooms: QTD, inclusions: { visa: true, flights: true, transfers: null, meals: null }, updated: '2026-10-05' },

  // ── Operator D (60+ character name) ────────────────────────────────
  { n: 25, op: 'D', title: '10 night Umrah from Heathrow, February', departureAirport: 'LHR', nights: [10, 6, 4], stars: [4, 4], ...h('D1'), bands: ['near', 'medium'], metres: [380, 720], dates: ['2027-02-01', '2027-02-11'], price: 1345, roomPrices: [1345, 1445, 1645], rooms: QTD, inclusions: NO_MEALS, ziyarat: true, flightType: 'direct', groupType: 'small-group', cancellation: 'Test policy: 30 day cancellation window.', deposit: 250, plan: true, image: 'p2', updated: '2026-10-02' },
  { n: 26, op: 'D', title: '14 night Ramadan Umrah from Manchester', departureAirport: 'MAN', nights: [14, 9, 5], stars: [5, 4], ...h('D2'), bands: ['near', 'near'], metres: [120, 300], dates: ['2027-02-22', '2027-03-08'], seasonLabel: 'Ramadan', price: 3650, roomPrices: [3650, 3850, 4250], rooms: QTD, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', groupType: 'small-group', deposit: 800, plan: true, updated: '2026-10-04' },
  { n: 27, op: 'D', title: '7 night off-peak Umrah from Stansted, October', departureAirport: 'STN', nights: [7, 4, 3], stars: [3, 3], ...h('D3'), bands: ['medium', 'far'], metres: [950, 1300], dates: ['2027-10-05', '2027-10-12'], price: 719, roomPrices: [719, 769, 869], rooms: QTD, inclusions: { visa: true, flights: true, transfers: false, meals: false }, ziyarat: false, flightType: 'multi-stop', groupType: 'large-group', plan: false, updated: '2026-09-21' },
  { n: 28, op: 'D', title: '21 night summer Umrah from Gatwick', departureAirport: 'LGW', nights: [21, 12, 9], stars: [4, 4], ...h('D4'), bands: ['medium', 'medium'], dates: ['2027-07-17', '2027-08-07'], seasonLabel: 'Summer holidays', price: 2995, roomPrices: [2995, 3150, 3450], rooms: QTD, inclusions: NO_MEALS, flightType: 'one-stop', groupType: 'large-group', updated: '2026-09-29' },
  { n: 29, op: 'D', title: '10 night Umrah from Luton, December', departureAirport: 'LTN', nights: [10, 5, 5], stars: [4, 3], ...h('D5'), bands: ['near', 'medium'], dates: ['2026-12-08', '2026-12-18'], price: 1325, roomPrices: [1325, 1425, 1625], rooms: QTD, inclusions: NO_MEALS, ziyarat: true, flightType: 'direct', updated: '2026-10-01' },
  { n: 30, op: 'D', title: '14 night Easter Umrah from Heathrow', departureAirport: 'LHR', nights: [14, 7, 7], stars: [5, 5], ...h('D6'), bands: ['near', 'near'], metres: [90, 140], dates: ['2027-03-24', '2027-04-07'], seasonLabel: 'Easter', price: 3450, roomPrices: [3450, 3650, 4050], rooms: QTD, inclusions: ALL_IN, ziyarat: true, flightType: 'direct', airline: 'Test Air', groupType: 'private', cancellation: 'Test policy: deposit non-refundable.', deposit: 700, plan: true, image: 'p1', updated: '2026-10-06' },

  // ── Operators E and F: published, but must never appear publicly ───
  { n: 31, op: 'E', title: '10 night Umrah from Heathrow, pending operator', departureAirport: 'LHR', nights: [10, 5, 5], stars: [4, 4], ...h('E1'), bands: ['near', 'near'], dates: ['2026-12-10', '2026-12-20'], price: 1099, roomPrices: [1099, 1199, 1399], rooms: QTD, inclusions: NO_MEALS, updated: '2026-10-01' },
  { n: 32, op: 'E', title: '7 night Umrah from Manchester, pending operator', departureAirport: 'MAN', nights: [7, 4, 3], stars: [3, 3], ...h('E2'), bands: ['medium', 'medium'], dates: ['2027-01-20', '2027-01-27'], price: 899, roomPrices: [899, 949, 1049], rooms: QTD, inclusions: NO_MEALS, updated: '2026-10-01' },
  { n: 33, op: 'F', title: '10 night Umrah from Birmingham, operator without ATOL', departureAirport: 'BHX', nights: [10, 5, 5], stars: [4, 4], ...h('F1'), bands: ['near', 'medium'], dates: ['2026-12-14', '2026-12-24'], price: 999, roomPrices: [999, 1099, 1299], rooms: QTD, inclusions: NO_MEALS, updated: '2026-10-01' },
  { n: 34, op: 'F', title: '14 night Umrah from Gatwick, operator without ATOL', departureAirport: 'LGW', nights: [14, 7, 7], stars: [3, 4], ...h('F2'), bands: ['far', 'near'], dates: ['2027-02-02', '2027-02-16'], price: 1399, roomPrices: [1399, 1499, 1699], rooms: QTD, inclusions: NO_MEALS, updated: '2026-10-01' },
];

/** Operator-only notes text with the stated room prices (no em dashes, no semicolons). */
export function roomPriceNote(roomPrices) {
  if (!roomPrices) return null;
  const parts = ['Quad', 'Triple', 'Double']
    .map((label, i) => (roomPrices[i] == null ? null : `${label} £${roomPrices[i].toLocaleString('en-GB')}`))
    .filter(Boolean);
  return parts.length ? `Room prices per person: ${parts.join(', ')}.` : null;
}

// ── Enquiries (A and B). The enquiries table has no status column: its
// states are live, removed after 90 days, and deleted with an account. ──
const LIVE = 'live';
export const ENQUIRIES = [
  { n: 1, pkg: 1, state: LIVE, daysAgo: 1, name: 'Test Customer One', email: 'customer-enquiries@test.local', phone: '07700 900001', travelMonth: '2026-12', message: 'Test enquiry: is the Makkah hotel within walking distance?', consent: true },
  { n: 2, pkg: 3, state: LIVE, daysAgo: 2, name: 'Test Customer One', email: 'customer-enquiries@test.local', travelMonth: '2027-02', message: 'Test enquiry: are there family rooms?' },
  { n: 3, pkg: 10, state: LIVE, daysAgo: 3, name: 'Test Customer One', email: 'customer-enquiries@test.local', phone: '07700 900001', travelMonth: '2026-12', consent: true },
  { n: 4, pkg: 2, state: LIVE, daysAgo: 4, name: 'Test Pilgrim Ahmed', phone: '07700 900002', travelMonth: '2026-11', message: 'Test enquiry: phone only, please call after 6pm.' },
  { n: 5, pkg: 13, state: LIVE, daysAgo: 6, name: 'Test Pilgrim Fatima', email: 'pilgrim-fatima@test.local', travelMonth: '2027-02', message: 'Test enquiry: wheelchair assistance needed.', consent: true },
  { n: 6, pkg: 11, state: LIVE, daysAgo: 9, name: 'Test Pilgrim Yusuf', email: 'pilgrim-yusuf@test.local', phone: '07700 900003', travelMonth: '2026-12' },
  { n: 7, pkg: 8, state: LIVE, daysAgo: 14, name: 'Test Pilgrim Maryam', email: 'pilgrim-maryam@test.local', travelMonth: '2027-01', message: 'Test enquiry: can we extend the Madinah stay?' },
  { n: 8, pkg: 15, state: LIVE, daysAgo: 30, name: 'Test Pilgrim Ibrahim', email: 'pilgrim-ibrahim@test.local', phone: '07700 900004', travelMonth: '2027-08', consent: false },
  { n: 9, pkg: 4, state: 'retention', daysAgo: 95 },
  { n: 10, pkg: 12, state: 'retention', daysAgo: 120 },
  { n: 11, pkg: 7, state: 'erased', daysAgo: 20 },
  { n: 12, pkg: 14, state: 'erased', daysAgo: 45 },
];

/**
 * Lead and booking chain for the customer with enquiries (quote request ->
 * offer -> booking intent), covering every quote request status (open,
 * responded, closed) and every booking status (started, contacted,
 * confirmed, closed). Complaints need a booking intent.
 */
export const LEADS = [
  { n: 1, op: 'A', pkg: 1, status: 'open', daysAgo: 2 },
  { n: 2, op: 'A', pkg: 3, status: 'responded', daysAgo: 20, offerPrice: 4450, booking: 'confirmed' },
  { n: 3, op: 'B', pkg: 10, status: 'responded', daysAgo: 5, offerPrice: 1295, booking: 'started' },
  { n: 4, op: 'B', pkg: 13, status: 'responded', daysAgo: 12, offerPrice: 3950, booking: 'contacted' },
  { n: 5, op: 'A', pkg: 2, status: 'closed', daysAgo: 60, offerPrice: 699, booking: 'closed', outcome: 'travelled' },
];

export const COMPLAINTS = [
  { n: 1, lead: 2, status: 'admin_triage', category: 'package_description', severity: 'medium', description: 'Test complaint: the hotel distance stated on the package does not match the confirmation.', operatorResponse: 'Test response: we are checking with the hotel.' },
  { n: 2, lead: 5, status: 'closed', category: 'service_quality', severity: 'low', description: 'Test complaint: the airport transfer was late on arrival.', operatorResponse: 'Test response: apologies, the driver was delayed.', adminNotes: 'Test note: resolved with the operator, closed.' },
];
