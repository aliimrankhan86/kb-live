'use client'

import React, { useCallback } from 'react';
import styles from './HotelRatingsFilter.module.css';

interface HotelRatingsFilterProps {
  value: number;
  onChange: (rating: number) => void;
}

export const HotelRatingsFilter: React.FC<HotelRatingsFilterProps> = ({
  value,
  onChange
}) => {
  const handleRatingChange = useCallback((rating: number) => {
    onChange(rating);
  }, [onChange]);

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Hotel Star Rating</h3>
      
      <div className={styles.starsContainer}>
        <div className={styles.stars} role="radiogroup" aria-label="Hotel star rating selection">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`${styles.star} ${rating <= value ? styles.filled : styles.empty}`}
              aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
              aria-checked={rating === value}
              role="radio"
              type="button"
              data-testid={`hotel-rating-${rating}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={rating <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </button>
          ))}
        </div>
        <span className={styles.ratingText} aria-live="polite">
          {value} {value === 1 ? 'star' : 'stars'}
        </span>
      </div>
    </div>
  );
};