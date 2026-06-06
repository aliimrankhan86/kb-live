import { Metadata } from 'next'
import { CityCorridor } from '@/components/marketing/CityCorridor'

export const metadata: Metadata = {
  title: 'Umrah Packages from Manchester 2026 – Compare & Book',
  description:
    'Browse and compare Umrah packages departing from Manchester. Verified UK operators, hotels near Haram, flights included. Request a quote or search packages now.',
}

export default function ManchesterUmrahPage() {
  return (
    <CityCorridor
      city="Manchester"
      region="England"
      metaTitle="Umrah Packages from Manchester 2026 – Compare & Book"
      metaDescription="Browse and compare Umrah packages departing from Manchester. Verified UK operators, hotels near Haram, flights included. Request a quote or search packages now."
      h1="Umrah Packages from Manchester"
      intro="Find Umrah packages departing from Manchester Airport (MAN). Compare verified UK operators side by side, filter by hotel rating and distance to Haram, and request a quote in minutes."
      queryParams="?type=umrah&departureCity=Manchester"
    />
  )
}