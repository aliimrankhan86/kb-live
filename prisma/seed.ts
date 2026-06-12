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

  await prisma.user.upsert({
    where: { id: 'op3' },
    create: {
      id: 'op3',
      email: 'operator3@example.com',
      role: 'operator',
      name: 'Yusuf Operator',
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
    where: { id: 'op3' },
    create: {
      id: 'op3',
      slug: 'zam-zam-travel',
      companyName: 'Zam Zam Travel Ltd',
      tradingName: 'Zam Zam Travel',
      companyRegistrationNumber: '11223344',
      verificationStatus: 'verified',
      verifiedAt: new Date('2026-01-10T09:00:00.000Z'),
      tier: 'verified',
      atolNumber: '99887',
      abtaMemberNumber: 'Z4321',
      contactEmail: 'hello@zamzamtravel.example.com',
      contactPhone: '+44 20 8900 1122',
      officeAddress: {
        line1: '7 Green Street',
        city: 'London',
        postcode: 'E7 8BT',
        country: 'GB',
      },
      websiteUrl: 'https://zamzamtravel.example.com',
      servingRegions: ['UK'],
      departureAirports: ['LHR', 'LGW'],
      yearsInBusiness: 5,
      pilgrimageTypesOffered: ['umrah'],
      branding: {
        logoUrl: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=400&q=80',
        primaryColor: '#2E7D32',
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

  // op2 packages — LHR departures
  await prisma.package.upsert({
    where: { id: 'pkg3' },
    create: {
      id: 'pkg3',
      operatorId: 'op2',
      title: '7 Nights Umrah — Budget (LHR)',
      slug: 'umrah-2026-7-nights-budget-lhr',
      status: 'published',
      pilgrimageType: 'umrah',
      seasonLabel: 'Flexible',
      priceType: 'from',
      pricePerPerson: 799,
      currency: 'GBP',
      totalNights: 7,
      nightsMakkah: 4,
      nightsMadinah: 3,
      hotelMakkahStars: 3,
      hotelMadinahStars: 3,
      hotelMakkahName: 'Al Kiswah Towers',
      hotelMadinahName: 'Dar Al Iman InterContinental',
      distanceToHaramMakkahMetres: 1200,
      distanceToHaramMadinahMetres: 650,
      distanceBandMakkah: '500m-1km',
      distanceBandMadinah: '500m-1km',
      airline: 'flydubai',
      departureAirport: 'LHR',
      flightType: 'one-stop',
      highlights: ['Budget-friendly', 'Installment plan', 'Flexible dates'],
      roomOccupancyOptions: {
        double: { pricePerPerson: 799, availability: 'available' },
        triple: { pricePerPerson: 729, availability: 'available' },
        quad: { pricePerPerson: 679, availability: 'available' },
      },
      inclusions: ['visa', 'flights', 'hotel', 'transfers'],
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      ],
    },
    update: {},
  });

  await prisma.package.upsert({
    where: { id: 'pkg4' },
    create: {
      id: 'pkg4',
      operatorId: 'op2',
      title: '14 Nights Umrah — Extended (LHR)',
      slug: 'umrah-2026-14-nights-extended-lhr',
      status: 'published',
      pilgrimageType: 'umrah',
      seasonLabel: 'Flexible',
      priceType: 'from',
      pricePerPerson: 1350,
      currency: 'GBP',
      totalNights: 14,
      nightsMakkah: 7,
      nightsMadinah: 7,
      hotelMakkahStars: 4,
      hotelMadinahStars: 4,
      hotelMakkahName: 'Hilton Suites Makkah',
      hotelMadinahName: 'Oberoi Madinah',
      distanceToHaramMakkahMetres: 450,
      distanceToHaramMadinahMetres: 300,
      distanceBandMakkah: '0-500m',
      distanceBandMadinah: '0-500m',
      airline: 'Emirates',
      departureAirport: 'LHR',
      flightType: 'one-stop',
      highlights: ['14-night extended stay', 'Equal Makkah/Madinah split', 'Emirates flights'],
      roomOccupancyOptions: {
        double: { pricePerPerson: 1350, availability: 'available' },
        triple: { pricePerPerson: 1249, availability: 'available' },
      },
      inclusions: ['visa', 'flights', 'hotel', 'transfers', 'meals'],
      images: [
        'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80',
      ],
    },
    update: {},
  });

  // op3 packages — Zam Zam Travel, LHR
  await prisma.package.upsert({
    where: { id: 'pkg5' },
    create: {
      id: 'pkg5',
      operatorId: 'op3',
      title: '7 Nights Umrah — Premium (LHR)',
      slug: 'umrah-2026-7-nights-premium-lhr',
      status: 'published',
      pilgrimageType: 'umrah',
      seasonLabel: 'Flexible',
      priceType: 'exact',
      pricePerPerson: 1099,
      currency: 'GBP',
      totalNights: 7,
      nightsMakkah: 4,
      nightsMadinah: 3,
      hotelMakkahStars: 5,
      hotelMadinahStars: 5,
      hotelMakkahName: 'Fairmont Makkah Clock Royal Tower',
      hotelMadinahName: 'Anwar Al Madinah Movenpick',
      distanceToHaramMakkahMetres: 120,
      distanceToHaramMadinahMetres: 200,
      distanceBandMakkah: '0-500m',
      distanceBandMadinah: '0-500m',
      airline: 'Saudi Arabian Airlines',
      departureAirport: 'LHR',
      flightType: 'direct',
      highlights: ['5-star both cities', 'Direct Saudia flights', 'Steps from Haram Makkah'],
      roomOccupancyOptions: {
        double: { pricePerPerson: 1099, availability: 'available' },
        triple: { pricePerPerson: 999, availability: 'available' },
      },
      inclusions: ['visa', 'flights', 'hotel', 'transfers'],
      images: [
        'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
      ],
    },
    update: {},
  });

  await prisma.package.upsert({
    where: { id: 'pkg6' },
    create: {
      id: 'pkg6',
      operatorId: 'op3',
      title: '10 Nights Umrah — Luxury (LHR)',
      slug: 'umrah-2026-10-nights-luxury-lhr',
      status: 'published',
      pilgrimageType: 'umrah',
      seasonLabel: 'Flexible',
      priceType: 'exact',
      pricePerPerson: 1499,
      currency: 'GBP',
      totalNights: 10,
      nightsMakkah: 5,
      nightsMadinah: 5,
      hotelMakkahStars: 5,
      hotelMadinahStars: 5,
      hotelMakkahName: 'Conrad Makkah',
      hotelMadinahName: 'Shaza Madina',
      distanceToHaramMakkahMetres: 80,
      distanceToHaramMadinahMetres: 180,
      distanceBandMakkah: '0-500m',
      distanceBandMadinah: '0-500m',
      airline: 'British Airways',
      departureAirport: 'LHR',
      flightType: 'direct',
      highlights: ['Luxury 5-star both cities', 'Direct BA flights', 'Private guided tours'],
      roomOccupancyOptions: {
        double: { pricePerPerson: 1499, availability: 'available' },
      },
      inclusions: ['visa', 'flights', 'hotel', 'transfers', 'meals', 'guide'],
      images: [
        'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=800&q=80',
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