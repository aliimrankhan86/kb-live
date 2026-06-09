'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package } from '@/lib/mock-packages'
import type { OperatorProfile } from '@/lib/types'
import { getRegionSettings } from '@/lib/i18n/region'
import { formatPriceForRegion } from '@/lib/i18n/format'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { InclusionChip } from '@/components/ui/InclusionChip'
import styles from './packages.module.css'

interface InclusionChip {
  label: string
  included: boolean
}

interface PackageCardProps {
  package: Package & { slug?: string }
  isShortlisted?: boolean
  isCompareSelected?: boolean
  onAddToShortlist: (packageId: string) => void
  onToggleCompare: (id: string) => void
  operator?: OperatorProfile
  inclusions?: InclusionChip[]
  nightsMakkah?: number
  nightsMadinah?: number
  priceType?: 'from' | 'exact' | 'fixed'
}


const HOTEL_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23222'/%3E%3Crect x='35' y='20' width='50' height='40' rx='2' fill='%23333'/%3E%3Crect x='45' y='35' width='10' height='25' rx='1' fill='%23444'/%3E%3Crect x='65' y='35' width='10' height='25' rx='1' fill='%23444'/%3E%3Crect x='35' y='20' width='50' height='8' rx='2' fill='%23444'/%3E%3C/svg%3E"

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isShortlisted = false,
  isCompareSelected = false,
  onAddToShortlist,
  onToggleCompare,
  operator,
  inclusions,
  nightsMakkah,
  nightsMadinah,
  priceType = 'from',
}) => {
  const regionSettings = React.useMemo(() => getRegionSettings(), [])
  const [makkahImgSrc, setMakkahImgSrc] = useState(pkg.makkahHotel.image || HOTEL_FALLBACK)
  const [madinaImgSrc, setMadinaImgSrc] = useState(pkg.madinaHotel.image || HOTEL_FALLBACK)

  const priceInfo = React.useMemo(
    () => formatPriceForRegion(pkg.price, pkg.currency, regionSettings),
    [pkg.currency, pkg.price, regionSettings]
  )

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={i <= rating ? styles.star : styles.starEmpty}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    }
    return stars
  }

  const totalNights = (nightsMakkah ?? 0) + (nightsMadinah ?? 0)
  const nightsLabel = nightsMakkah && nightsMadinah
    ? `${nightsMakkah} Makkah / ${nightsMadinah} Madinah`
    : totalNights > 0
      ? `${totalNights} nights total`
      : null

  return (
    <article className={styles.packageCard} data-testid={`package-card-${pkg.id}`}>
      {/* Operator header */}
      {operator && (
        <div className={styles.cardHeader}>
          <span className={styles.operatorName} title={operator.companyName}>
            {operator.companyName}
          </span>
          {operator.verificationStatus === 'verified' && <VerifiedBadge />}
          {operator.atolNumber && (
            <span className={styles.atolBadge}>ATOL {operator.atolNumber}</span>
          )}
        </div>
      )}

      <div className={styles.cardBody}>
        {/* Flight Column */}
        <div className={styles.flightColumn}>
          <div className={styles.flightSegment}>
            <div className={styles.flightHeader}>
              <svg
                className={styles.planeIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span>Departure</span>
            </div>
            <div className={styles.flightDate}>{pkg.departure.date}</div>
            <div className={styles.flightDuration}>{pkg.departure.duration}</div>
            <div className={styles.flightRoute}>{pkg.departure.route}</div>
          </div>

          <div className={styles.flightSegment}>
            <div className={styles.flightHeader}>
              <svg
                className={styles.planeIcon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span>Return</span>
            </div>
            <div className={styles.flightDate}>{pkg.return.date}</div>
            <div className={styles.flightDuration}>{pkg.return.duration}</div>
            <div className={styles.flightRoute}>{pkg.return.route}</div>
          </div>
        </div>

        {/* Hotels Column */}
        <div className={styles.hotelsColumn}>
          <div className={styles.hotelBlock}>
            <Image
              src={makkahImgSrc}
              alt={`${pkg.makkahHotel.name} in ${pkg.makkahHotel.location}`}
              width={120}
              height={80}
              className={styles.hotelImage}
              onError={() => setMakkahImgSrc(HOTEL_FALLBACK)}
              unoptimized={makkahImgSrc === HOTEL_FALLBACK}
            />
            <div className={styles.hotelLocation}>{pkg.makkahHotel.location}</div>
            <div className={styles.hotelName}>{pkg.makkahHotel.name}</div>
            <div className={styles.hotelRating}>
              {renderStars(pkg.makkahHotel.rating)}
              <span className={styles.ratingText} aria-label={`${pkg.makkahHotel.rating} out of 5 stars`}>
                {pkg.makkahHotel.rating}/5
              </span>
            </div>
            <div className={styles.hotelDistance}>{pkg.makkahHotel.distance}</div>
          </div>

          <div className={styles.hotelBlock}>
            <Image
              src={madinaImgSrc}
              alt={`${pkg.madinaHotel.name} in ${pkg.madinaHotel.location}`}
              width={120}
              height={80}
              className={styles.hotelImage}
              onError={() => setMadinaImgSrc(HOTEL_FALLBACK)}
              unoptimized={madinaImgSrc === HOTEL_FALLBACK}
            />
            <div className={styles.hotelLocation}>{pkg.madinaHotel.location}</div>
            <div className={styles.hotelName}>{pkg.madinaHotel.name}</div>
            <div className={styles.hotelRating}>
              {renderStars(pkg.madinaHotel.rating)}
              <span className={styles.ratingText} aria-label={`${pkg.madinaHotel.rating} out of 5 stars`}>
                {pkg.madinaHotel.rating}/5
              </span>
            </div>
            <div className={styles.hotelDistance}>{pkg.madinaHotel.distance}</div>
          </div>
        </div>

        {/* Price & Details Column */}
        <div className={styles.priceColumn}>
          <div className={styles.price}>
            <div className={styles.priceAmount}>
              {priceInfo.formatted}
            </div>
            <div className={styles.priceMeta}>
              {priceType === 'from' && <span className={styles.priceFrom}>from</span>}
              <span className={styles.priceNote}>{pkg.priceNote}</span>
            </div>
          </div>

          {nightsLabel && (
            <div className={styles.nightsBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {nightsLabel}
            </div>
          )}

          {/* Inclusion chips */}
          {inclusions && inclusions.length > 0 && (
            <div className={styles.inclusionsRow} aria-label="Package inclusions">
              {inclusions.map((chip) => (
                <InclusionChip key={chip.label} chip={chip} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className={styles.packageActions}>
            <button
              type="button"
              className={`${styles.actionButton} ${isShortlisted ? styles.actionButtonActive : ''}`}
              data-testid={`shortlist-toggle-${pkg.id}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToShortlist(pkg.id)
              }}
              aria-pressed={isShortlisted}
              aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
              title={isShortlisted ? 'Shortlisted' : 'Shortlist'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isShortlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className={styles.actionButtonText}>
                {isShortlisted ? 'Saved' : 'Save'}
              </span>
            </button>
            <button
              type="button"
              className={`${styles.actionButton} ${isCompareSelected ? styles.actionButtonActive : ''}`}
              data-testid={`package-compare-toggle-${pkg.id}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleCompare(pkg.id)
              }}
              aria-pressed={isCompareSelected}
              aria-label={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
              title={isCompareSelected ? 'Comparing' : 'Compare'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span className={styles.actionButtonText}>
                {isCompareSelected ? 'Added' : 'Compare'}
              </span>
            </button>
            <Link
              href={`/packages/${pkg.slug ?? pkg.id}`}
              className={styles.primaryAction}
              aria-label={`View full details for ${pkg.makkahHotel.name} and ${pkg.madinaHotel.name} package`}
            >
              View
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PackageCard
