import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UmrahSearchForm } from '@/components/umrah/UmrahSearchForm';

const hiddenNames = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((i) => i.name).sort();

describe('UmrahSearchForm: an untouched form never silently narrows results', () => {
  it('submits no airport, dates, budget or season by default', () => {
    const { container } = render(<UmrahSearchForm departureAirports={['LHR', 'BHX']} />);
    expect(hiddenNames(container)).toEqual(['adults', 'type']);
  });

  it('only offers airports that live packages depart from', () => {
    render(<UmrahSearchForm departureAirports={['BHX']} />);
    const options = [...screen.getByTestId('departure-airport-select').querySelectorAll('option')].map((o) => o.value);
    expect(options).toEqual(['', 'BHX']);
  });

  it('sends dates only after the traveller chooses exact dates', () => {
    const { container } = render(<UmrahSearchForm departureAirports={['LHR']} />);
    fireEvent.click(screen.getByTestId('travel-mode-exact'));
    expect(hiddenNames(container)).toEqual(['adults', 'departureDate', 'returnDate', 'type']);
  });

  it('a holiday period sends a season, not invented dates', () => {
    const { container } = render(<UmrahSearchForm departureAirports={['LHR']} />);
    fireEvent.click(screen.getByTestId('travel-mode-period'));
    const season = container.querySelector<HTMLInputElement>('input[name="season"]');
    expect(season?.value).toBe('ramadan');
    expect(container.querySelector('input[name="departureDate"]')).toBeNull();
    expect(screen.queryByText(/May - Jun/)).toBeNull();
  });
});
