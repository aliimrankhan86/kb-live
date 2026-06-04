-- ═══════════════════════════════════════════════════════════════════════
-- supabase/seed.sql — Manual seed for Supabase SQL Editor
-- Run via Supabase Dashboard → SQL Editor → New Query
-- Idempotent: uses ON CONFLICT (upsert pattern)
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Users ────────────────────────────────────────────────────────────
INSERT INTO users (id, email, role, name, created_at, updated_at)
VALUES
  ('cust1', 'customer@example.com', 'customer', 'Ali Client', NOW(), NOW()),
  ('op1', 'operator@example.com', 'operator', 'Ahmed Operator', NOW(), NOW()),
  ('op2', 'operator2@example.com', 'operator', 'Fatima Operator', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = NOW();

-- ─── Operator Profiles ────────────────────────────────────────────────
INSERT INTO operator_profiles (
  id, slug, company_name, trading_name, company_registration_number,
  verification_status, verified_at, tier,
  atol_number, abta_member_number, contact_email, contact_phone,
  office_address, website_url, serving_regions, departure_airports,
  years_in_business, pilgrimage_types_offered, branding,
  can_receive_bookings, bank_details_active, onboarding_complete,
  created_at, updated_at
)
VALUES (
  'op1', 'al-hidayah-travel', 'Al-Hidayah Travel', 'Al-Hidayah', '12345678',
  'verified', '2026-02-15T09:00:00Z', 'verified',
  '11234', 'Y1234', 'info@alhidayah.com', '+44 20 7123 4567',
  '{"line1":"45 Whitechapel Road","city":"London","postcode":"E1 1DU","country":"GB"}',
  'https://alhidayah.example.com', ARRAY['UK'], ARRAY['LHR', 'MAN', 'BHX'],
  12, ARRAY['umrah', 'hajj'],
  '{"logoUrl":"https://images.unsplash.com/photo-1477511801984-4ad318ed9846?auto=format&fit=crop&w=400&q=80","primaryColor":"#D4AF37"}',
  true, true, true,
  '2024-01-10T09:00:00Z', '2026-02-15T09:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  company_name = EXCLUDED.company_name,
  trading_name = EXCLUDED.trading_name,
  verification_status = EXCLUDED.verification_status,
  tier = EXCLUDED.tier,
  can_receive_bookings = EXCLUDED.can_receive_bookings,
  bank_details_active = EXCLUDED.bank_details_active,
  onboarding_complete = EXCLUDED.onboarding_complete,
  updated_at = NOW();

INSERT INTO operator_profiles (
  id, slug, company_name, trading_name, company_registration_number,
  verification_status, verified_at, tier,
  atol_number, abta_member_number, contact_email, contact_phone,
  office_address, website_url, serving_regions, departure_airports,
  years_in_business, pilgrimage_types_offered, branding,
  can_receive_bookings, bank_details_active, onboarding_complete,
  created_at, updated_at
)
VALUES (
  'op2', 'makkah-tours', 'Makkah Tours', 'Makkah Tours UK', '87654321',
  'verified', '2026-02-15T09:00:00Z', 'listed',
  '54321', 'P6789', 'sales@makkahtours.com', '+44 161 554 7821',
  '{"line1":"18 Deansgate","line2":"Suite 2A","city":"Manchester","postcode":"M3 1AZ","country":"GB"}',
  'https://makkahtours.example.com', ARRAY['UK', 'EU'], ARRAY['MAN', 'LHR', 'LGW', 'BHX'],
  8, ARRAY['umrah', 'hajj'],
  '{"logoUrl":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80","primaryColor":"#1B6C8F"}',
  false, false, false,
  '2024-05-02T10:30:00Z', '2026-02-15T09:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  company_name = EXCLUDED.company_name,
  trading_name = EXCLUDED.trading_name,
  verification_status = EXCLUDED.verification_status,
  tier = EXCLUDED.tier,
  can_receive_bookings = EXCLUDED.can_receive_bookings,
  bank_details_active = EXCLUDED.bank_details_active,
  onboarding_complete = EXCLUDED.onboarding_complete,
  updated_at = NOW();

-- ─── Payment Details (op1 active) ─────────────────────────────────────
INSERT INTO payment_details (
  id, operator_id, account_holder_name, bank_name, sort_code, account_number,
  currency, country, status, activated_at, created_by_user_id,
  phone_verified_at, phone_last_four, created_at, updated_at
)
VALUES (
  'pay_op1_active', 'op1', 'Al-Hidayah Travel Ltd', 'Example Business Bank',
  '20-00-00', '12345678', 'GBP', 'GB', 'active',
  '2026-02-15T09:00:00Z', 'op1',
  '2026-02-15T09:00:00Z', '4567', NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  account_holder_name = EXCLUDED.account_holder_name,
  bank_name = EXCLUDED.bank_name,
  sort_code = EXCLUDED.sort_code,
  account_number = EXCLUDED.account_number,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ─── Packages ─────────────────────────────────────────────────────────
INSERT INTO packages (
  id, operator_id, title, slug, status, pilgrimage_type, season_label,
  price_type, price_per_person, currency, total_nights,
  nights_makkah, nights_madinah, hotel_makkah_stars, hotel_madinah_stars,
  distance_band_makkah, distance_band_madinah,
  airline, departure_airport, flight_type,
  highlights, room_occupancy_options, inclusions, images
)
VALUES (
  'pkg1', 'op1', '7 Nights Umrah Package — Value', 'umrah-2026-7-nights-value',
  'published', 'umrah', 'March 2026',
  'per_person', 1299, 'GBP', 7,
  4, 3, 3, 3,
  '500m-1km', '500m-1km',
  'Saudi Arabian Airlines', 'LHR', 'direct',
  ARRAY['Visa included', '3-star hotels', 'Direct flights'],
  '{"double":{"pricePerPerson":1299,"availability":"available"},"triple":{"pricePerPerson":1199,"availability":"available"},"quad":{"pricePerPerson":1099,"availability":"limited"}}',
  ARRAY['visa', 'flights', 'hotel', 'transfers', 'guide'],
  ARRAY['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  status = EXCLUDED.status,
  price_per_person = EXCLUDED.price_per_person,
  updated_at = NOW();

INSERT INTO packages (
  id, operator_id, title, slug, status, pilgrimage_type, season_label,
  price_type, price_per_person, currency, total_nights,
  nights_makkah, nights_madinah, hotel_makkah_stars, hotel_madinah_stars,
  hotel_makkah_name, hotel_madinah_name,
  distance_to_haram_makkah_metres, distance_to_haram_madinah_metres,
  distance_band_makkah, distance_band_madinah,
  airline, departure_airport, flight_type,
  highlights, room_occupancy_options, inclusions, images
)
VALUES (
  'pkg2', 'op1', '10 Nights Umrah Package — Premium', 'umrah-2026-10-nights-premium',
  'published', 'umrah', 'Ramadan 2026',
  'per_person', 2499, 'GBP', 10,
  5, 5, 5, 5,
  'Hilton Makkah Convention Hotel', 'Pullman Zamzam Madina',
  300, 150,
  '0-500m', '0-500m',
  'Saudi Arabian Airlines', 'LHR', 'direct',
  ARRAY['5-star hotels', 'Direct flights', 'Private transfers'],
  '{"double":{"pricePerPerson":2499,"availability":"available"},"triple":{"pricePerPerson":2299,"availability":"available"}}',
  ARRAY['visa', 'flights', 'hotel', 'transfers', 'guide', 'meals'],
  ARRAY['https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80']
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  status = EXCLUDED.status,
  price_per_person = EXCLUDED.price_per_person,
  updated_at = NOW();