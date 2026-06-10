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

export interface OperatorEnquiryAlertProps {
  operatorName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | undefined;
  packageName: string;
  travelDates: string;
  groupSize: string;
  message: string;
  refCode: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export default function OperatorEnquiryAlert({
  operatorName,
  customerName,
  customerEmail,
  customerPhone,
  packageName,
  travelDates,
  groupSize,
  message,
  refCode,
}: OperatorEnquiryAlertProps) {
  const contactLine = [customerName, customerEmail, customerPhone].filter(Boolean).join(', ');

  return (
    <Html>
      <Head />
      <Preview>
        New enquiry from {customerName} — {packageName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>PilgrimCompare</Heading>
          <Text style={text}>Salaam {operatorName},</Text>
          <Text style={text}>New enquiry through PilgrimCompare:</Text>

          <Section style={detailBox}>
            <DetailRow label="Customer" value={contactLine} />
            <DetailRow label="Package" value={packageName} />
            <DetailRow label="Travel dates" value={travelDates} />
            <DetailRow label="Group size" value={groupSize} />
            {message && <DetailRow label="Message" value={message} />}
          </Section>

          <Text style={text}>
            Please reply to the customer within 48 hours. Replying to this email goes
            straight to them.
          </Text>

          <Section style={refBox}>
            <Text style={refLabel}>Reference</Text>
            <Text style={refCode_}>{refCode}</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            <Link href={`${BASE_URL}/operator/dashboard`} style={footerLink}>
              View operator dashboard
            </Link>{' '}
            &middot; PilgrimCompare
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={detailRow}>
      <span style={detailLabel}>{label}:</span> {value}
    </Text>
  );
}

const body = { backgroundColor: '#f4f4f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '32px auto', padding: '32px', maxWidth: '560px', borderRadius: '8px' };
const logo = { fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' };
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 12px' };
const detailBox = { backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', padding: '16px 20px', margin: '16px 0', borderRadius: '6px' };
const detailRow = { fontSize: '14px', color: '#333333', lineHeight: '1.5', margin: '0 0 8px' };
const detailLabel = { fontWeight: 600, color: '#111111' };
const refBox = { backgroundColor: '#fdf8e7', borderLeft: '4px solid #d4a017', padding: '16px 20px', margin: '20px 0', borderRadius: '0 4px 4px 0' };
const refLabel = { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const refCode_ = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '2px' };
const hr = { borderColor: '#eeeeee', margin: '24px 0' };
const footer = { fontSize: '12px', color: '#aaaaaa', margin: '4px 0' };
const footerLink = { color: '#aaaaaa' };
