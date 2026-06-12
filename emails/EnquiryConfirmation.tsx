import * as React from 'react';
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

export interface SimilarPackage {
  title: string;
  slug: string;
  pricePerPerson: number;
  currency: string;
  totalNights: number;
}

export interface EnquiryConfirmationProps {
  customerName: string;
  packageName: string;
  operatorName: string;
  refCode: string;
  similarPackages: SimilarPackage[];
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export default function EnquiryConfirmation({
  customerName,
  packageName,
  operatorName,
  refCode,
  similarPackages,
}: EnquiryConfirmationProps) {
  const firstName = customerName.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>
        Your enquiry about {packageName} has been sent to {operatorName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>PilgrimCompare</Heading>
          <Text style={text}>Salaam {firstName},</Text>
          <Text style={text}>
            Your enquiry about <strong>{packageName}</strong> has been sent to{' '}
            <strong>{operatorName}</strong>. They typically respond within 48 hours,
            directly to this email address.
          </Text>

          <Section style={refBox}>
            <Text style={refLabel}>Your PilgrimCompare reference code</Text>
            <Text style={refCode_}>{refCode}</Text>
          </Section>

          <Text style={disclaimer}>
            Your PilgrimCompare reference code is a tracking code, not a payment receipt.
            You pay the operator directly. PilgrimCompare does not receive or hold your
            payment. Your travel contract, cancellations and refunds are with the operator
            named on this page.
          </Text>

          {similarPackages.length > 0 && (
            <>
              <Hr style={hr} />
              <Heading as="h2" style={subheading}>
                While you wait — similar packages to compare
              </Heading>
              {similarPackages.map((pkg) => (
                <Section key={pkg.slug} style={packageRow}>
                  <Row>
                    <Column>
                      <Link
                        href={`${BASE_URL}/packages/${pkg.slug}`}
                        style={packageLink}
                      >
                        {pkg.title}
                      </Link>
                      <Text style={packageMeta}>
                        {pkg.totalNights} nights &middot; from {pkg.currency}{' '}
                        {pkg.pricePerPerson.toLocaleString('en-GB')} pp
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}
            </>
          )}

          <Hr style={hr} />
          <Text style={footer}>Questions? Reply to this email.</Text>
          <Text style={footer}>
            PilgrimCompare &middot;{' '}
            <Link href={BASE_URL} style={footerLink}>
              {BASE_URL.replace('https://', '')}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: '#f4f4f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '32px auto', padding: '32px', maxWidth: '560px', borderRadius: '8px' };
const logo = { fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' };
const subheading = { fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginTop: '4px', marginBottom: '8px' };
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 12px' };
const refBox = { backgroundColor: '#fdf8e7', borderLeft: '4px solid #d4a017', padding: '16px 20px', margin: '20px 0', borderRadius: '0 4px 4px 0' };
const refLabel = { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const refCode_ = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '2px' };
const disclaimer = { fontSize: '13px', color: '#666666', lineHeight: '1.5', borderTop: '1px solid #eeeeee', paddingTop: '16px', margin: '16px 0 0' };
const hr = { borderColor: '#eeeeee', margin: '24px 0' };
const packageRow = { margin: '0 0 16px' };
const packageLink = { fontSize: '14px', color: '#1a73e8', fontWeight: 600, textDecoration: 'none' };
const packageMeta = { fontSize: '13px', color: '#666666', margin: '4px 0 0' };
const footer = { fontSize: '12px', color: '#aaaaaa', margin: '4px 0' };
const footerLink = { color: '#aaaaaa' };
