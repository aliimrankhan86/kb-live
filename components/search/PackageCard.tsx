'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from '@/lib/mock-packages';
import { CURRENCY_CHANGE_EVENT, getRegionSettings } from '@/lib/i18n/region';
import { formatPriceForRegion } from '@/lib/i18n/format';
import styles from './packages.module.css';

interface PackageCardProps {
  package: Package & { slug?: string };
  isShortlisted?: boolean;
  isCompareSelected?: boolean;
  onAddToShortlist: (packageId: string) => void;
  onToggleCompare: (id: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  isShortlisted = false,
  isCompareSelected = false,
  onAddToShortlist,
  onToggleCompare,
}) => {
  const [regionSettings, setRegionSettings] = React.useState(() => getRegionSettings());

  React.useEffect(() => {
    const updateSettings = () => setRegionSettings(getRegionSettings());
    window.addEventListener(CURRENCY_CHANGE_EVENT, updateSettings);
    return () => window.removeEventListener(CURRENCY_CHANGE_EVENT, updateSettings);
  }, []);

  const priceInfo = React.useMemo(
    () => formatPriceForRegion(pkg.price, pkg.currency, regionSettings),
    [pkg.currency, pkg.price, regionSettings]
  );

  const renderStars = (rating: number) => {
    const stars = [];
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
      );
    }
    return stars;
  };

  return (
    <article className={styles.packageCard}>
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
            src={pkg.makkahHotel.image}
            alt={`${pkg.makkahHotel.name} in ${pkg.makkahHotel.location}`}
            width={120}
            height={80}
            className={styles.hotelImage}
            style={{ width: 'auto', height: 'auto' }}
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
            src={pkg.madinaHotel.image}
            alt={`${pkg.madinaHotel.name} in ${pkg.madinaHotel.location}`}
            width={120}
            height={80}
            className={styles.hotelImage}
            style={{ width: 'auto', height: 'auto' }}
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

      {/* Price Column */}
      <div className={styles.priceColumn}>
        <div className={styles.price}>
          <div className={styles.priceAmount}>
            {priceInfo.formatted}
          </div>
          <div className={styles.priceNote}>{pkg.priceNote}</div>
        </div>

        <div className={styles.packageActions}>
          <button
            type="button"
            className={styles.secondaryAction}
            data-testid={`shortlist-toggle-${pkg.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToShortlist(pkg.id);
            }}
            aria-pressed={isShortlisted}
            aria-label={isShortlisted ? `Remove from shortlist` : `Add ${pkg.makkahHotel.name} and ${pkg.madinaHotel.name} to shortlist`}
          >
            {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
          </button>
          <button
            type="button"
            className={styles.secondaryAction}
            data-testid={`package-compare-toggle-${pkg.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCompare(pkg.id);
            }}
            aria-pressed={isCompareSelected}
            aria-label={isCompareSelected ? `Remove from comparison` : `Add ${pkg.makkahHotel.name} and ${pkg.madinaHotel.name} to compare`}
          >
            {isCompareSelected ? 'Added for comparison' : 'Add to Compare'}
          </button>
          <Link
            href={`/packages/${pkg.slug ?? pkg.id}`}
            className={styles.primaryAction}
            aria-label={`View full details for ${pkg.makkahHotel.name} and ${pkg.madinaHotel.name} package`}
          >
            See full package detail
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PackageCard;
