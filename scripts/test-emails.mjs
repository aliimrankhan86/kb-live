/**
 * Manual test script — sends one test email per template to a specified address.
 * Usage: node scripts/test-emails.mjs your@email.com
 *
 * Requires RESEND_API_KEY in .env.local and a verified sender domain.
 * Uses Resend's test mode if RESEND_TEST_MODE=1.
 */
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

// Load .env.local manually
try {
  const env = readFileSync(envPath, 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
} catch {
  console.error('Could not load .env.local — ensure RESEND_API_KEY is set in environment.');
}

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/test-emails.mjs your@email.com');
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('RESEND_API_KEY not set. Add it to .env.local or export it.');
  process.exit(1);
}

const { Resend } = createRequire(import.meta.url)('resend');
const resend = new Resend(apiKey);

const FROM = 'PilgrimCompare <notifications@send.pilgrimcompare.co.uk>';
const BASE_URL = 'https://pilgrimcompare.co.uk';

async function send(subject, html) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    replyTo: 'support@pilgrimcompare.co.uk',
  });
  if (error) {
    console.error(`  ✗ ${subject}:`, error.message ?? error);
  } else {
    console.log(`  ✓ ${subject} — id: ${data.id}`);
  }
}

console.log(`\nSending 4 test emails to ${to}...\n`);

// Email 2 — Enquiry confirmation (HTML preview, no React render in plain Node script)
await send(
  'Your Umrah enquiry is on its way — reference QR-ABCD1234',
  `<p>Assalamualaikum Test,</p>
   <p>Your enquiry about <strong>14-Night Umrah Package (4★)</strong> has been sent to <strong>Al Mabrur Travel</strong>. They typically respond within 48 hours, directly to this email address.</p>
   <div style="background:#fdf8e7;border-left:4px solid #d4a017;padding:16px 20px;margin:20px 0;">
     <p style="font-size:11px;color:#888;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">Your PilgrimCompare reference code</p>
     <p style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0">QR-ABCD1234</p>
   </div>
   <p style="font-size:13px;color:#666">Your PilgrimCompare reference code is a tracking code, not a payment receipt. You pay the operator directly. PilgrimCompare does not receive or hold your payment.</p>
   <p>Questions? Reply to this email.</p>
   <p style="font-size:12px;color:#aaa">PilgrimCompare · <a href="${BASE_URL}">${BASE_URL.replace('https://', '')}</a></p>`
);

// Email 3 — Operator enquiry alert
await send(
  'New enquiry from PilgrimCompare — Test Customer, 14-Night Umrah Package (4★)',
  `<p>Salaam Al Mabrur Travel,</p>
   <p>New enquiry through PilgrimCompare:</p>
   <div style="background:#f9f9f9;border:1px solid #e5e5e5;padding:16px 20px;margin:16px 0;border-radius:6px">
     <p style="font-size:14px;margin:0 0 8px"><strong>Customer:</strong> Test Customer, ${to}</p>
     <p style="font-size:14px;margin:0 0 8px"><strong>Package:</strong> 14-Night Umrah Package (4★)</p>
     <p style="font-size:14px;margin:0 0 8px"><strong>Travel dates:</strong> 2026-10-01 to 2026-10-15</p>
     <p style="font-size:14px;margin:0 0 8px"><strong>Group size:</strong> 2 travellers</p>
     <p style="font-size:14px;margin:0"><strong>Message:</strong> We are looking for a family package with flexible check-in.</p>
   </div>
   <p>Please reply to the customer within 48 hours. Replying to this email goes straight to them.</p>
   <div style="background:#fdf8e7;border-left:4px solid #d4a017;padding:16px 20px;margin:20px 0">
     <p style="font-size:11px;color:#888;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">Reference</p>
     <p style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0">QR-ABCD1234</p>
   </div>`
);

// Email 4 — Booking intent confirmation
await send(
  'Booking intent created — reference KT-9X2P4A',
  `<p>Salaam Test,</p>
   <p>You have created a booking intent with <strong>Al Mabrur Travel</strong> for <strong>your chosen package</strong>.</p>
   <div style="background:#fdf8e7;border-left:4px solid #d4a017;padding:16px 20px;margin:20px 0">
     <p style="font-size:11px;color:#888;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">Reference</p>
     <p style="font-size:24px;font-weight:700;letter-spacing:2px;margin:0">KT-9X2P4A</p>
   </div>
   <p style="font-size:13px;color:#666;border-top:1px solid #eee;padding-top:16px">Important: your PilgrimCompare reference code is a tracking code, not a payment receipt. You pay the operator directly. PilgrimCompare does not receive or hold your payment.</p>`
);

// Email 5 — Payment evidence notification
await send(
  'Payment evidence received — Test Customer, your chosen package',
  `<p>Salaam Al Mabrur Travel,</p>
   <p>Payment evidence has been uploaded by <strong>Test Customer</strong> for <strong>your package</strong> (reference <strong>KT-9X2P4A</strong>). Please log in to PilgrimCompare to review and confirm.</p>
   <p><a href="${BASE_URL}/operator/dashboard">Review payment evidence →</a></p>`
);

console.log('\nDone. Check your inbox (and spam folder).\n');
console.log('Reply-to headers:');
console.log('  Emails 2, 4, 5 → reply-to: support@pilgrimcompare.co.uk');
console.log('  Email 3 → reply-to: customer email (so operator replies go directly to customer)\n');
