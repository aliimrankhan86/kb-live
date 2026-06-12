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
  Text,
} from '@react-email/components';

export interface OutcomeFollowupProps {
  customerName: string;
  operatorName: string;
  packageName: string;
  refCode: string;
  intentId: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export default function OutcomeFollowup({
  customerName,
  operatorName,
  packageName,
  refCode,
  intentId,
}: OutcomeFollowupProps) {
  const firstName = customerName.split(' ')[0] || 'there';
  const bookedUrl = `${BASE_URL}/api/outcomes/${intentId}?result=booked`;
  const notBookedUrl = `${BASE_URL}/api/outcomes/${intentId}?result=not_booked`;
  const decidingUrl = `${BASE_URL}/api/outcomes/${intentId}?result=deciding`;

  return (
    <Html>
      <Head />
      <Preview>
        Did your Umrah booking with {operatorName} go ahead?
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>PilgrimCompare</Heading>
          <Text style={text}>Salaam {firstName},</Text>
          <Text style={text}>
            A short while ago you created a booking intent with{' '}
            <strong>{operatorName}</strong> for <strong>{packageName}</strong>{' '}
            (reference <strong>{refCode}</strong>). One quick question: did you
            complete your booking?
          </Text>

          <Text style={optionText}>
            <Link href={bookedUrl} style={optionLink}>
              Yes, I booked
            </Link>
          </Text>
          <Text style={optionText}>
            <Link href={notBookedUrl} style={optionLink}>
              No, I did not book
            </Link>
          </Text>
          <Text style={optionText}>
            <Link href={decidingUrl} style={optionLink}>
              Still deciding
            </Link>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Your reply helps us improve PilgrimCompare. It only takes one click.
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
const optionText = { margin: '0 0 10px' };
const optionLink = { fontSize: '15px', color: '#1a73e8', fontWeight: 600 };
const hr = { borderColor: '#eeeeee', margin: '24px 0' };
const footer = { fontSize: '12px', color: '#aaaaaa', margin: '4px 0' };
const footerLink = { color: '#aaaaaa' };
