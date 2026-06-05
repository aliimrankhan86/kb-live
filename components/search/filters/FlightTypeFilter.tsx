'use client'

import React, { useCallback } from 'react';
import styles from './FlightTypeFilter.module.css';

interface FlightTypeFilterProps {
  value: {
    direct: boolean;
    stopover: boolean;
  };
  onChange: (flightType: { direct: boolean; stopover: boolean }) => void;
}

export const FlightTypeFilter: React.FC<FlightTypeFilterProps> = ({
  value,
  onChange
}) => {
  const handleDirectChange = useCallback((direct: boolean) => {
    onChange({ ...value, direct });
  }, [value, onChange]);

  const handleStopoverChange = useCallback((stopover: boolean) => {
    onChange({ ...value, stopover });
  }, [value, onChange]);

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Flight Type</h3>
      
      <div className={styles.options}>
        <label className={styles.option} data-testid="flight-direct-option">
          <input
            type="checkbox"
            checked={value.direct}
            onChange={(e) => handleDirectChange(e.target.checked)}
            className={styles.checkbox}
            aria-describedby="direct-description"
            data-testid="flight-direct-checkbox"
          />
          <span className={styles.checkmark} aria-hidden="true">
            {value.direct && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            )}
          </span>
          <span className={styles.labelText} id="direct-description">
            Direct Flights
          </span>
        </label>

        <label className={styles.option} data-testid="flight-stopover-option">
          <input
            type="checkbox"
            checked={value.stopover}
            onChange={(e) => handleStopoverChange(e.target.checked)}
            className={styles.checkbox}
            aria-describedby="stopover-description"
            data-testid="flight-stopover-checkbox"
          />
          <span className={styles.checkmark} aria-hidden="true">
            {value.stopover && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            )}
          </span>
          <span className={styles.labelText} id="stopover-description">
            Flights with Stopover
          </span>
        </label>
      </div>
    </div>
  );
};