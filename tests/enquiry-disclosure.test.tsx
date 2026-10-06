import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnquiryForm } from '@/components/enquiry/EnquiryForm';

const summary = {
  packageId: 'p1', packageTitle: 'Test package', operatorName: 'Test Operator', tripType: 'Umrah',
  departureAirport: 'LHR', duration: '10 nights', hotels: 'Not provided', price: '£1,495',
};

describe('enquiry form discloses data sharing before submit (standards §12, §10.3)', () => {
  it('names the operator who receives the details, above the Send button', () => {
    render(<EnquiryForm summary={summary} packageSlug="test-package" />);
    const disclosure = screen.getByTestId('enquiry-data-sharing');
    expect(disclosure).toHaveTextContent('your details go to Test Operator');
    expect(disclosure).toHaveTextContent('independent data controller');
    const submit = screen.getByTestId('enquiry-submit');
    expect(disclosure.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
