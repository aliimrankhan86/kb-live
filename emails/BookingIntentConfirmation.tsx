import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface BookingIntentConfirmationProps {
  customerName: string;
  operatorName: string;
  packageName: string | null;
  refCode: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export default function BookingIntentConfirmation({
  customerName,
  operatorName,
  packageName,
  refCode,
}: BookingIntentConfirmationProps) {
  const firstName = customerName.split(' ')[0] || 'there';
  const packageDesc = packageName ?? 'your chosen package';

  return (
    <Html>
      <Head />
      <Preview>Booking intent created — reference {refCode}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>PilgrimCompare</Heading>
          <Text style={text}>Salaam {firstName},</Text>
          <Text style={text}>
            You have created a booking intent with <strong>{operatorName}</strong> for{' '}
            <strong>{packageDesc}</strong>.
          </Text>

          <Section style={refBox}>
            <Text style={refLabel}>Reference</Text>
            <Text style={refCode_}>{refCode}</Text>
          </Section>

          <Text style={disclaimer}>
            Important: your PilgrimCompare reference code is a tracking code, not a payment
            receipt. You pay the operator directly. PilgrimCompare does not receive or hold
            your payment.
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            <Link href={`${BASE_URL}/login`} style={footerLink}>
              Log in to PilgrimCompare
            </Link>{' '}
            to view your booking intent.
          </Text>
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
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 12px' };
const refBox = { backgroundColor: '#fdf8e7', borderLeft: '4px solid #d4a017', padding: '16px 20px', margin: '20px 0', borderRadius: '0 4px 4px 0' };
const refLabel = { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const refCode_ = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '2px' };
const disclaimer = { fontSize: '13px', color: '#666666', lineHeight: '1.5', borderTop: '1px solid #eeeeee', paddingTop: '16px', margin: '16px 0 0' };
const hr = { borderColor: '#eeeeee', margin: '24px 0' };
const footer = { fontSize: '12px', color: '#aaaaaa', margin: '4px 0' };
const footerLink = { color: '#aaaaaa' };
