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

export interface PaymentEvidenceNotificationProps {
  operatorName: string;
  customerName: string;
  packageName: string | null;
  refCode: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export default function PaymentEvidenceNotification({
  operatorName,
  customerName,
  packageName,
  refCode,
}: PaymentEvidenceNotificationProps) {
  const packageDesc = packageName ?? 'your package';

  return (
    <Html>
      <Head />
      <Preview>
        Payment evidence received from {customerName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>PilgrimCompare</Heading>
          <Text style={text}>Salaam {operatorName},</Text>
          <Text style={text}>
            Payment evidence has been uploaded by <strong>{customerName}</strong> for{' '}
            <strong>{packageDesc}</strong> (reference <strong>{refCode}</strong>). Please
            log in to PilgrimCompare to review and confirm.
          </Text>

          <Section style={ctaSection}>
            <Link href={`${BASE_URL}/operator/dashboard`} style={ctaLink}>
              Review payment evidence &rarr;
            </Link>
          </Section>

          <Hr style={hr} />
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
const ctaSection = { margin: '24px 0' };
const ctaLink = { fontSize: '15px', color: '#1a73e8', fontWeight: 600 };
const hr = { borderColor: '#eeeeee', margin: '24px 0' };
const footer = { fontSize: '12px', color: '#aaaaaa', margin: '4px 0' };
const footerLink = { color: '#aaaaaa' };
