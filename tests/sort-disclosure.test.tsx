import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparePreview } from '@/components/marketing/ComparePreview';
import { OperatorProfileDetail } from '@/components/operators/OperatorProfileDetail';
import { NEUTRAL_SORT_DISCLOSURE } from '@/lib/content-rules';
import { MockDB } from '@/lib/api/mock-db';

describe('standards §16: every package list discloses the neutral sort', () => {
  const pkgs = MockDB.getPackages().slice(0, 2);
  it('home compare preview', () => {
    render(<ComparePreview packages={pkgs} />);
    expect(screen.getByTestId('preview-sort-disclosure')).toHaveTextContent(NEUTRAL_SORT_DISCLOSURE);
  });
  it('operator profile package list', () => {
    render(<OperatorProfileDetail operator={MockDB.getOperators()[0]} packages={pkgs} />);
    expect(screen.getByTestId('operator-sort-disclosure')).toHaveTextContent(NEUTRAL_SORT_DISCLOSURE);
  });
});
