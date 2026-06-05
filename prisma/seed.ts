import { prisma } from '../lib/api/db/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ──────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: 'cust1' },
    create: {
      id: 'cust1',
      email: 'customer@example.com',
      role: 'customer',
      name: 'Ali Client',
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: 'op1' },
    create: {
      id: 'op1',
      email: 'operator@example.com',
      role: 'operator',
      name: 'Ahmed Operator',
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: 'op2' },
    create: {
      id: 'op2',
      email: 'operator2@example.com',
      role: 'operator',
      name: 'Fatima Operator',
    },
    update: {},
  });

  // ─── Operator Profiles ──────────────────────────────────────────────
  await prisma.operatorProfile.upsert({
    where: { id: 'op1' },
    create: {
      id: 'op1',
      slug: 'al-hidayah-travel',
      companyName: 'Al-Hidayah Travel',
      tradingName: 'Al-Hidayah',
      companyRegistrationNumber: '12345678',
      verificationStatus: 'verified',
      verifiedAt: new Date('2026-02-15T09:00:00.000Z'),
      tier: 'verified',
      atolNumber: '11234',
      abtaMemberNumber: 'Y1234',
      contactEmail: 'info@alhidayah.com',
      contactPhone: '+44 20 7123 4567',
      officeAddress: {
        line1: '45 Whitechapel Road',
        city: 'London',
        postcode: 'E1 1DU',
        country: 'GB',
      },
      websiteUrl: 'https://alhidayah.example.com',
      servingRegions: ['UK'],
      departureAirports: ['LHR', 'MAN', 'BHX'],
      yearsInBusiness: 12,
      pilgrimageTypesOffered: ['umrah', 'hajj'],
      branding: {
        logoUrl: 'https://images.unsplash.com/photo-1477511801984-4ad318ed9846?auto=format&fit=crop&w=400&q=80',
        primaryColor: '#D4AF37',
      },
      canReceiveBookings: true,
      bankDetailsActive: true,
      onboardingComplete: true,
    },
    update: {},
  });

  await prisma.operatorProfile.upsert({
    where: { id: 'op2' },
    create: {
      id: 'op2',
      slug: 'makkah-tours',
      companyName: 'Makkah Tours',
      tradingName: 'Makkah Tours UK',
      companyRegistrationNumber: '87654321',
      verificationStatus: 'verified',
      verifiedAt: new Date('2026-02-15T09:00:00.000Z'),
      tier: 'listed',
      atolNumber: '54321',
      abtaMemberNumber: 'P6789',
      contactEmail: 'sales@makkahtours.com',
      contactPhone: '+44 161 554 7821',
      officeAddress: {
        line1: '18 Deansgate',
        line2: 'Suite 2A',
        city: 'Manchester',
        postcode: 'M3 1AZ',
        country: 'GB',
      },
      websiteUrl: 'https://makkahtours.example.com',
      servingRegions: ['UK', 'EU'],
      departureAirports: ['MAN', 'LHR', 'LGW', 'BHX'],
      yearsInBusiness: 8,
      pilgrimageTypesOffered: ['umrah', 'hajj'],
      branding: {
        logoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
        primaryColor: '#1B6C8F',
      },
      canReceiveBookings: false,
      bankDetailsActive: false,
      onboardingComplete: false,
    },
    update: {},
  });

  // ─── Payment Details (op1 active) ───────────────────────────────────
  await prisma.paymentDetails.upsert({
    where: { id: 'pay_op1_active' },
    create: {
      id: 'pay_op1_active',
      operatorId: 'op1',
      accountHolderName: 'Al-Hidayah Travel Ltd',
      bankName: 'Example Business Bank',
      sortCode: '20-00-00',
      accountNumber: '12345678',
      currency: 'GBP',
      country: 'GB',
      status: 'active',
      activatedAt: new Date('2026-02-15T09:00:00.000Z'),
      createdByUserId: 'op1',
      phoneVerifiedAt: new Date('2026-02-15T09:00:00.000Z'),
      phoneLastFour: '4567',
    },
    update: {},
  });

  // ─── Packages ───────────────────────────────────────────────────────
  await prisma.package.upsert({
    where: { id: 'pkg1' },
    create: {
      id: 'pkg1',
      operatorId: 'op1',
      title: '7 Nights Umrah Package — Value',
      slug: 'umrah-2026-7-nights-value',
      status: 'published',
      pilgrimageType: 'umrah',
      seasonLabel: 'March 2026',
      priceType: 'per_person',
      pricePerPerson: 1299,
      currency: 'GBP',
      totalNights: 7,
      nightsMakkah: 4,
      nightsMadinah: 3,
      hotelMakkahStars: 3,
      hotelMadinahStars: 3,
      distanceBandMakkah: '500m-1km',
      distanceBandMadinah: '500m-1km',
      airline: 'Saudi Arabian Airlines',
      departureAirport: 'LHR',
      flightType: 'direct',
      highlights: ['Visa included', '3-star hotels', 'Direct flights'],
      roomOccupancyOptions: {
        double: { pricePerPerson: 1299, availability: 'available' },
        triple: { pricePerPerson: 1199, availability: 'available' },
        quad: { pricePerPerson: 1099, availability: 'limited' },
      },
      inclusions: ['visa', 'flights', 'hotel', 'transfers', 'guide'],
      images: [
        'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
      ],
    },
    update: {},
  });

  await prisma.package.upsert({
    where: { id: 'pkg2' },
    create: {
      id: 'pkg2',
      operatorId: 'op1',
      title: '10 Nights Umrah Package — Premium',
      slug: 'umrah-2026-10-nights-premium',
      status: 'published',
      pilgrimageType: 'umrah',
      seasonLabel: 'Ramadan 2026',
      priceType: 'per_person',
      pricePerPerson: 2499,
      currency: 'GBP',
      totalNights: 10,
      nightsMakkah: 5,
      nightsMadinah: 5,
      hotelMakkahStars: 5,
      hotelMadinahStars: 5,
      hotelMakkahName: 'Hilton Makkah Convention Hotel',
      hotelMadinahName: 'Pullman Zamzam Madina',
      distanceToHaramMakkahMetres: 300,
      distanceToHaramMadinahMetres: 150,
      distanceBandMakkah: '0-500m',
      distanceBandMadinah: '0-500m',
      airline: 'Saudi Arabian Airlines',
      departureAirport: 'LHR',
      flightType: 'direct',
      highlights: ['5-star hotels', 'Direct flights', 'Private transfers'],
      roomOccupancyOptions: {
        double: { pricePerPerson: 2499, availability: 'available' },
        triple: { pricePerPerson: 2299, availability: 'available' },
      },
      inclusions: ['visa', 'flights', 'hotel', 'transfers', 'guide', 'meals'],
      images: [
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      ],
    },
    update: {},
  });

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });