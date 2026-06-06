import { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'

export const metadata: Metadata = {
  title: 'Umrah Packages from Birmingham 2026 – Compare & Book',
  description:
    'Browse and compare Umrah packages departing from Birmingham. Verified UK operators, hotels near Haram, flights included. Request a quote or search packages now.',
}

export default function BirminghamUmrahPage() {
  return (
    <CityCorridor
      city="Birmingham"
      region="England"
      metaTitle="Umrah Packages from Birmingham 2026 – Compare & Book"
      metaDescription="Browse and compare Umrah packages departing from Birmingham. Verified UK operators, hotels near Haram, flights included. Request a quote or search packages now."
      h1="Umrah Packages from Birmingham"
      intro="Find Umrah packages departing from Birmingham Airport (BHX). Compare verified UK operators side by side, filter by hotel rating and distance to Haram, and request a quote in minutes."
      queryParams="?type=umrah&departureCity=Birmingham"
    />
  )
}