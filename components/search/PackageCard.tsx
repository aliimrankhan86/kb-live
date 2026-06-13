'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SearchPackageDisplay } from '@/components/search/search-utils'
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
  package: SearchPackageDisplay
  isShortlisted?: boolean
  isCompareSelected?: boolean
  compareFull?: boolean
  onAddToShortlist: (packageId: string) => void
  onToggleCompare: (id: string) => void
  operator?: OperatorProfile
  inclusions?: InclusionChip[]
  nightsMakkah?: number
  nightsMadinah?: number
  priceType?: 'from' | 'exact' | 'fixed'
}


const HOTEL_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23222'/%3E%3Crect x='35' y='20' width='50' height='40' rx='2' fill='%23333'/%3E%3Crect x='45' y='35' width='10' height='25' rx='1' fill='%23444'/%3E%3Crect x='65' y='35' width='10' height='25' rx='1' fill='%23444'/%3E%3Crect x='35' y='20' width='50' height='8' rx='2' fill='%23444'/%3E%3C/svg%3E"

const isPlaceholder = (v?: string) => !v || v === 'TBC' || v === '-' || v.trim() === ''

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isShortlisted = false,
  isCompareSelected = false,
  compareFull = false,
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

  const renderStars = (rating: number | null, label: string) => {
    // Operator has not supplied a star rating — state that honestly rather than
    // rendering a fabricated default. (Data-integrity rule: missing = Not provided.)
    if (rating == null) {
      return (
        <span className={styles.notProvided} aria-label={`Hotel rating not provided, ${label}`}>
          Not provided
        </span>
      )
    }
    return (
      <span className={styles.hotelRating} role="img" aria-label={`${rating} out of 5 stars, ${label}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={i <= rating ? styles.star : styles.starEmpty}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        <span className={styles.ratingText}>{rating}/5</span>
      </span>
    )
  }

  const totalNights = (nightsMakkah ?? 0) + (nightsMadinah ?? 0)
  const nightsLabel = totalNights > 0
    ? `${totalNights} night${totalNights === 1 ? '' : 's'}`
    : null
  const splitLabel = nightsMakkah && nightsMadinah
    ? `${nightsMakkah} Makkah · ${nightsMadinah} Madinah`
    : null

  // Condense the noisy departure/return blocks into one quiet trip line.
  const tripDates = !isPlaceholder(pkg.departure.date) && !isPlaceholder(pkg.return.date)
    ? `${pkg.departure.date} – ${pkg.return.date}`
    : null
  const route = !isPlaceholder(pkg.departure.route) ? pkg.departure.route : null

  // Disable the compare control only when the basket is full AND this card
  // isn't already one of the selected packages.
  const compareLocked = compareFull && !isCompareSelected

  const hotelRow = (hotel: SearchPackageDisplay['makkahHotel'], imgSrc: string, onErr: () => void) => (
    <div className={styles.hotelRow}>
      <Image
        src={imgSrc}
        alt=""
        width={64}
        height={64}
        className={styles.hotelThumb}
        onError={onErr}
        unoptimized={imgSrc === HOTEL_FALLBACK}
      />
      <div className={styles.hotelInfo}>
        <span className={styles.hotelLocation}>{hotel.location}</span>
        <span className={hotel.name ? styles.hotelName : styles.notProvided}>
          {hotel.name ?? 'Not provided'}
        </span>
        <div className={styles.hotelMeta}>
          {renderStars(hotel.rating, hotel.location)}
          {!isPlaceholder(hotel.distance) && (
            <span className={styles.hotelDistance}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {hotel.distance}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <article
      className={`${styles.packageCard} ${isCompareSelected ? styles.packageCardSelected : ''}`}
      data-testid={`package-card-${pkg.id}`}
    >
      {/* Header: operator + trust, with a quiet Save bookmark */}
      <div className={styles.cardHeader}>
        <div className={styles.operatorBlock}>
          <div className={styles.operatorTopRow}>
            <span className={styles.operatorName} title={operator?.companyName}>
              {operator?.companyName ?? 'Travel operator'}
            </span>
            <button
              type="button"
              className={`${styles.saveButton} ${isShortlisted ? styles.saveButtonActive : ''}`}
              data-testid={`shortlist-toggle-${pkg.id}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToShortlist(pkg.id)
              }}
              aria-pressed={isShortlisted}
              aria-label={isShortlisted ? 'Saved — tap to remove from your saved list' : 'Save this package for later'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isShortlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span className={styles.saveButtonText}>{isShortlisted ? 'Saved' : 'Save'}</span>
            </button>
          </div>
          {(operator?.verificationStatus === 'verified' || operator?.atolNumber) && (
            <div className={styles.trustRow}>
              {operator?.verificationStatus === 'verified' && <VerifiedBadge />}
              {operator?.atolNumber && (
                <span className={styles.atolBadge}>ATOL {operator.atolNumber}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* Price first — this is what people compare on */}
        <div className={styles.priceBlock}>
          <div className={styles.priceLead}>
            {priceType === 'from' && <span className={styles.priceFrom}>from</span>}
            <span className={styles.priceAmount}>{priceInfo.formatted}</span>
          </div>
          <span className={styles.priceNote}>{pkg.priceNote || 'per person'}</span>
        </div>

        {/* Trip summary line: nights + dates + route, only when real */}
        {(nightsLabel || tripDates || route) && (
          <div className={styles.tripMeta}>
            {nightsLabel && (
              <span className={styles.tripPill}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                {nightsLabel}{splitLabel ? ` · ${splitLabel}` : ''}
              </span>
            )}
            {route && (
              <span className={styles.tripPill}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                {route}
              </span>
            )}
            {tripDates && <span className={styles.tripPillMuted}>{tripDates}</span>}
          </div>
        )}

        {/* Hotels — compact rows with thumbnails */}
        <div className={styles.hotels}>
          {hotelRow(pkg.makkahHotel, makkahImgSrc, () => setMakkahImgSrc(HOTEL_FALLBACK))}
          {hotelRow(pkg.madinaHotel, madinaImgSrc, () => setMadinaImgSrc(HOTEL_FALLBACK))}
        </div>

        {/* What's included */}
        {inclusions && inclusions.length > 0 && (
          <div className={styles.inclusionsRow} aria-label="What's included">
            <span className={styles.inclusionsLabel}>Included:</span>
            {inclusions.map((chip) => (
              <InclusionChip key={chip.label} chip={chip} />
            ))}
          </div>
        )}
      </div>

      {/* Actions: clear Compare toggle + primary View details */}
      <div className={styles.cardActions}>
        <label
          className={`${styles.compareToggle} ${isCompareSelected ? styles.compareToggleActive : ''} ${compareLocked ? styles.compareToggleDisabled : ''}`}
        >
          <input
            type="checkbox"
            className={styles.compareCheckbox}
            checked={isCompareSelected}
            disabled={compareLocked}
            data-testid={`package-compare-toggle-${pkg.id}`}
            onChange={() => onToggleCompare(pkg.id)}
            aria-label={isCompareSelected ? `Remove ${operator?.companyName ?? 'this'} package from comparison` : `Select ${operator?.companyName ?? 'this'} package to compare`}
          />
          <span className={styles.compareBox} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <span className={styles.compareToggleText}>
            {isCompareSelected ? 'Selected' : 'Compare'}
          </span>
        </label>
        <Link
          href={`/packages/${pkg.slug ?? pkg.id}`}
          className={styles.primaryAction}
          data-testid={`package-view-${pkg.id}`}
          aria-label={`View full details for the ${operator?.companyName ?? ''} package`}
        >
          View details
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  )
}

export default PackageCard
