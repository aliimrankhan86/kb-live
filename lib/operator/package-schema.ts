import { z } from 'zod';
import { AIRPORT_CODES } from '@/lib/airports';

// ─── Operator package create/update schema ────────────────────────────────────
// Shared by the API route and unit tests.
//
// Data-integrity rule (see AI_NOTES §27/§28): the form must never manufacture a
// value the operator did not choose. So the only defaults here are honest ones:
//   - distance bands default to 'unknown' (the existing "Not provided" sentinel),
//     NOT 'medium' — a skipped distance reads as "Not provided" downstream.
//   - hotel stars and group type have NO default — skipped = absent (→ null in
//     the adapter → "Not provided").
//   - inclusions are three-state (founder decision 2026-10-06): true / false /
//     null = not stated (→ "Not provided"); the default is all null.

const inclusionsSchema = z.object({
  visa: z.boolean().nullable(),
  flights: z.boolean().nullable(),
  transfers: z.boolean().nullable(),
  meals: z.boolean().nullable(),
});

const roomOccupancySchema = z.object({
  single: z.boolean(),
  double: z.boolean(),
  triple: z.boolean(),
  quad: z.boolean(),
});

const airportCodeSchema = z.enum(AIRPORT_CODES);

// Optional price per person by room type (item 9). Same rule as the headline
// price: a stated price is greater than 0. Blank is sent as null (not stated,
// "Not provided"), so an edit can clear it; never stored as 0.
const roomPriceSchema = z.number().positive('Room prices must be greater than 0, or left blank').nullable().optional();

export const packageSchema = z.object({
  // Step 1 — required
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be 120 characters or fewer'),
  pilgrimageType: z.enum(['umrah', 'hajj']),
  // Step 1 — optional
  seasonLabel: z.string().max(80).optional(),
  dateWindow: z.object({
    start: z.string().default(''),
    end: z.string().default(''),
  }).optional(),
  // Step 2 — required
  pricePerPerson: z.number().positive('Price must be greater than 0'),
  priceType: z.enum(['exact', 'from', 'fixed']),
  currency: z.literal('GBP').default('GBP'),
  priceQuadPerPerson: roomPriceSchema,
  priceTriplePerPerson: roomPriceSchema,
  priceDoublePerPerson: roomPriceSchema,
  // Step 2 — optional
  depositAmount: z.number().nonnegative().optional(),
  paymentPlanAvailable: z.boolean().optional(),
  // Step 3
  nightsMakkah: z.number().int().min(1, 'Makkah nights must be at least 1'),
  nightsMadinah: z.number().int().min(1, 'Madinah nights must be at least 1'),
  totalNights: z.number().int().min(2),
  hotelMakkahName: z.string().optional(),
  // No default — a skipped star rating stays absent (→ "Not provided").
  hotelMakkahStars: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
  // 'unknown' is the honest unset sentinel (renders "Not provided"); never 'medium'.
  distanceBandMakkah: z.enum(['near', 'medium', 'far', 'unknown']).default('unknown'),
  distanceToHaramMakkahMetres: z.number().int().nonnegative().optional(),
  hotelMadinahName: z.string().optional(),
  hotelMadinahStars: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
  distanceBandMadinah: z.enum(['near', 'medium', 'far', 'unknown']).default('unknown'),
  distanceToHaramMadinahMetres: z.number().int().nonnegative().optional(),
  // Step 4
  airline: z.string().optional(),
  departureAirport: airportCodeSchema.optional(),
  flightType: z.enum(['direct', 'one-stop', 'multi-stop']).optional(),
  // Step 5
  inclusions: inclusionsSchema.default({ visa: null, flights: null, transfers: null, meals: null }),
  // No default room types: a skipped selection reads "Not provided", never invented.
  roomOccupancyOptions: roomOccupancySchema.default({ single: false, double: false, triple: false, quad: false }),
  // Step 5 — Ziyarat: operator-stated, three-state. No default; a skipped value
  // stays absent (→ "Not provided"). Must NOT coerce blank to false.
  ziyaratIncluded: z.boolean().optional(),
  ziyaratDetails: z.string().max(500).optional(),
  // Step 6 — no default: a skipped group type stays absent (→ "Not provided").
  cancellationPolicy: z.string().max(1000).optional(),
  groupType: z.enum(['private', 'small-group', 'large-group']).optional(),
  // Step 7
  highlights: z.array(z.string().max(200)).max(5).optional(),
  notes: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(8).optional(),
  // Step 8 — publish status
  status: z.enum(['draft', 'published']).default('draft'),
});

export const updatePackageSchema = packageSchema.partial().extend({
  id: z.string().min(1, 'Package ID required'),
});

export type PackageSchemaInput = z.input<typeof packageSchema>;
export type PackageSchemaOutput = z.output<typeof packageSchema>;
