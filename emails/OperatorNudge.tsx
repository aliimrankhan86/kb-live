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

export interface OperatorNudgeProps {
  operatorName: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  hoursOld: number;
  refCode: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pilgrimcompare.co.uk';

export default function OperatorNudge({
  operatorName,
  customerName,
  customerEmail,
  packageName,
  hoursOld,
  refCode,
}: OperatorNudgeProps) {
  const firstName = operatorName.split(' ')[0] || operatorName;

  return (
    <Html>
      <Head />
      <Preview>
        Reminder — unanswered enquiry from {customerName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>PilgrimCompare</Heading>
          <Text style={text}>Salaam {firstName},</Text>
          <Text style={text}>
            You have an enquiry from <strong>{customerName}</strong> about{' '}
            <strong>{packageName}</strong> that has not been answered. It is now{' '}
            <strong>{hoursOld} hours</strong> old.
          </Text>
          <Text style={text}>
            Please reply to them directly at{' '}
            <Link href={`mailto:${customerEmail}`} style={link}>
              {customerEmail}
            </Link>{' '}
            today.
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

const body = { backgroundColor: '#f4f4f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '32px auto', padding: '32px', maxWidth: '560px', borderRadius: '8px' };
const logo = { fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' };
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 12px' };
const link = { color: '#1a73e8' };
const refBox = { backgroundColor: '#fdf8e7', borderLeft: '4px solid #d4a017', padding: '16px 20px', margin: '20px 0', borderRadius: '0 4px 4px 0' };
const refLabel = { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
const refCode_ = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0, letterSpacing: '2px' };
const hr = { borderColor: '#eeeeee', margin: '24px 0' };
const footer = { fontSize: '12px', color: '#aaaaaa', margin: '4px 0' };
const footerLink = { color: '#aaaaaa' };
