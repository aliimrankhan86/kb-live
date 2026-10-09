import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompareBar } from '@/components/search/CompareBar';

// UX-05: two packages from one operator looked identical in the compare bar.
describe('compare bar chips', () => {
  it('show nights and package title beside the operator', () => {
    render(
      <CompareBar
        items={[
          { id: 'a', label: 'Al Amanah', detail: '7 nights · Winter Umrah' },
          { id: 'b', label: 'Al Amanah', detail: '14 nights · Ramadan Umrah' },
        ]}
        onRemove={() => {}} onClear={() => {}} onCompare={() => {}}
      />
    );
    expect(screen.getByText('7 nights · Winter Umrah')).toBeTruthy();
    expect(screen.getByText('14 nights · Ramadan Umrah')).toBeTruthy();
  });
});
