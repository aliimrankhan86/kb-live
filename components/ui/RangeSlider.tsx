import React, { useCallback } from 'react';
import styles from './RangeSlider.module.css';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  step: number;
  minGap: number;
  onChange: (range: [number, number]) => void;
  minLabel?: string;
  maxLabel?: string;
  'aria-label-min'?: string;
  'aria-label-max'?: string;
  'data-testid-min'?: string;
  'data-testid-max'?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  step,
  minGap,
  onChange,
  minLabel,
  maxLabel,
  'aria-label-min': ariaLabelMin,
  'aria-label-max': ariaLabelMax,
  'data-testid-min': testIdMin,
  'data-testid-max': testIdMax,
}) => {
  const clamp = useCallback(
    (v: number) => Math.max(min, Math.min(max, Math.round(v / step) * step)),
    [min, max, step]
  );

  const leftPercent = ((value[0] - min) / (max - min)) * 100;
  const rightPercent = ((value[1] - min) / (max - min)) * 100;
  const activeWidth = rightPercent - leftPercent;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const clamped = clamp(parseInt(e.target.value));
      onChange([
        Math.min(clamped, value[1] - minGap),
        value[1],
      ]);
    },
    [clamp, minGap, onChange, value]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const clamped = clamp(parseInt(e.target.value));
      onChange([
        value[0],
        Math.max(clamped, value[0] + minGap),
      ]);
    },
    [clamp, minGap, onChange, value]
  );

  return (
    <div className={styles.slider}>
      <div className={styles.trackWrapper}>
        <div className={styles.track} aria-hidden="true" />
        <div
          className={styles.activeTrack}
          style={{
            left: `${leftPercent}%`,
            width: `${activeWidth}%`,
          }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMinChange}
          className={styles.rangeInput}
          aria-label={ariaLabelMin}
          data-testid={testIdMin}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className={styles.rangeInput}
          aria-label={ariaLabelMax}
          data-testid={testIdMax}
        />
      </div>
      {(minLabel || maxLabel) && (
        <div className={styles.labels}>
          {minLabel && <span className={styles.label}>{minLabel}</span>}
          {maxLabel && <span className={styles.label}>{maxLabel}</span>}
        </div>
      )}
    </div>
  );
};