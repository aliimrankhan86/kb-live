'use client'

import React from 'react';
import styles from './HotelRatingsFilter.module.css';

interface HotelRatingsFilterProps {
  value: number;
  onChange: (rating: number) => void;
}

export const HotelRatingsFilter: React.FC<HotelRatingsFilterProps> = ({
  value,
  onChange
}) => {
  const handleRatingChange = (rating: number) => {
    onChange(rating);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        onClick={() => handleRatingChange(index + 1)}
        className={`${styles.star} ${index < rating ? styles.filled : styles.empty}`}
        aria-label={`${index + 1} star${index + 1 === 1 ? '' : 's'}`}
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      </button>
    ));
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Hotel Ratings:</h3>
      
      <div className={styles.starsContainer}>
        <div className={styles.stars} role="radiogroup" aria-label="Hotel rating selection">
          {renderStars(value)}
        </div>
        <span className={styles.ratingText} aria-live="polite">
          {value} out of 5 stars
        </span>
      </div>
    </div>
  );
};
