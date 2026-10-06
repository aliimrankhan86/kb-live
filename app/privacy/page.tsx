import type { Metadata } from 'next';
import { LEGAL_ENTITY_BLOCK, registeredOfficeClause } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy | PilgrimCompare',
  description:
    'How PilgrimCompare collects, uses and protects your personal data under UK GDPR.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | PilgrimCompare',
    description: 'How PilgrimCompare collects, uses and protects your personal data under UK GDPR.',
    url: 'https://pilgrimcompare.co.uk/privacy',
    siteName: 'PilgrimCompare',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | PilgrimCompare',
    description: 'How PilgrimCompare collects, uses and protects your personal data under UK GDPR.',
  },
};

const LAST_UPDATED = '6 October 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-[var(--textMuted)]">Last updated: {LAST_UPDATED}</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">1. Who is the data controller</h2>
          <p className="mb-3 text-sm leading-relaxed">
            {LEGAL_ENTITY_BLOCK.tradingName} is a trading name of{' '}
            <strong>{LEGAL_ENTITY_BLOCK.companyName}</strong>, registered in{' '}
            {LEGAL_ENTITY_BLOCK.registeredCountry}, company number{' '}
            {LEGAL_ENTITY_BLOCK.companyNumber}{registeredOfficeClause()}. For data protection purposes,{' '}
            {LEGAL_ENTITY_BLOCK.companyName} is the data controller of your personal
            information.
          </p>
          <p className="mb-2 text-sm leading-relaxed">
            Contact:{' '}
            <a
              href={`mailto:${LEGAL_ENTITY_BLOCK.contactEmail}`}
              className="underline text-[var(--accent)]"
            >
              {LEGAL_ENTITY_BLOCK.contactEmail}
            </a>
          </p>
          <p className="text-sm leading-relaxed">
            Data Protection Officer:{' '}
            <a href="mailto:dpo@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">
              dpo@pilgrimcompare.co.uk
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">2. What we collect</h2>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-2">
            <li>
              <strong>Account data:</strong> name, email address, password hash, user role.
            </li>
            <li>
              <strong>Enquiry details:</strong> your name, email address, phone number, travel month, your message and whether you agreed to marketing emails, when you send an enquiry to an operator.
            </li>
            <li>
              <strong>Quote request details:</strong> travel preferences (season, dates, nights in
              Makkah and Madinah, hotel rating, distance to the Haram, room occupancy, budget,
              inclusions), departure city, and any notes you provide when you ask operators for
              quotes.
            </li>
            <li>
              <strong>Hajj availability alerts:</strong> your email address, when you ask us to
              tell you about Hajj packages.
            </li>
            <li>
              <strong>Booking intent data:</strong> reference codes, selected package, payment
              evidence (payer name, payment reference and any files you upload), and
              communication notes.
            </li>
            <li>
              <strong>Analytics data:</strong> anonymised page view data via Vercel Web
              Analytics, which uses no cookies and stores no personal identifiers. See
              Section 8.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">3. Lawful bases for processing</h2>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-2">
            <li>
              <strong>Performance of a contract:</strong> processing your account, routing your
              enquiry to the operator you choose, and managing booking intents.
            </li>
            <li>
              <strong>Legitimate interests:</strong> anonymised analytics to improve the
              service, fraud prevention, and platform security.
            </li>
            <li>
              <strong>Legal obligation:</strong> retaining audit logs and complaint records as
              required by UK consumer and financial regulation.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">4. Data sharing: important disclosure</h2>
          <p className="mb-4 rounded-lg border border-[var(--borderSubtle)] bg-[var(--surface)] p-4 text-sm font-medium leading-relaxed">
            When you send an enquiry, your contact details are shared with the operator you
            enquire with. From that point the operator is an independent data controller of
            your details under its own privacy policy.
          </p>
          <p className="mb-3 text-sm leading-relaxed">
            We do not sell your personal data. Beyond the operator disclosure above, we share
            data only with:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              <strong>Service providers:</strong> Supabase (database, EU West / Ireland
              region), Vercel (hosting), and Resend (transactional email delivery), all under
              data processing agreements.
            </li>
            <li>
              <strong>Regulators:</strong> where required by law.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">5. How long we keep your data</h2>
          <table className="w-full text-left text-sm mt-3 border border-[var(--borderSubtle)]">
            <thead className="bg-[var(--surface)]">
              <tr>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Data type</th>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">
                  Retention period
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">User account (active)</td>
                <td className="px-3 py-2">Until you delete your account</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">User account (deleted)</td>
                <td className="px-3 py-2">
                  If your account has no quote requests, bookings or complaints, deleting it in Settings removes your account, marketing choices and Hajj availability alerts straight away, and removes your name and contact details from your enquiries. Other accounts, including operator accounts, are deleted by hand: email dpo@pilgrimcompare.co.uk.
                </td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Enquiries</td>
                <td className="px-3 py-2">
                  Your name, email address, phone number and message are removed 90 days after you send the enquiry. We keep the reference code, operator, package, travel month and date.
                </td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Marketing choices</td>
                <td className="px-3 py-2">Kept until you delete your account or ask us to remove them.</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Hajj availability alerts</td>
                <td className="px-3 py-2">Kept until you delete your account or ask us to remove them.</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Quote requests</td>
                <td className="px-3 py-2">Kept until you ask us to delete them.</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Booking intent data</td>
                <td className="px-3 py-2">
                  Kept until you ask us to delete it. Payment evidence files stop being shown 90 days after you upload them, unless a dispute is open.
                </td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Audit log entries</td>
                <td className="px-3 py-2">7 years (legal and financial requirement)</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Complaint records</td>
                <td className="px-3 py-2">7 years (consumer protection requirement)</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Operator statistics</td>
                <td className="px-3 py-2">Counts of package views, quote requests and bookings for each operator. They hold no names or contact details and have no set end date.</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Emails we send you</td>
                <td className="px-3 py-2">Sent through Resend. We do not keep a copy. Resend keeps delivery records under its own retention policy.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">6. Your rights</h2>
          <p className="mb-3 text-sm leading-relaxed">Under UK GDPR you have the right to:</p>
          <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li><strong>Access:</strong> request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> request deletion of your personal data.</li>
            <li>
              <strong>Portability:</strong> receive your data in a structured, machine-readable
              format.
            </li>
            <li>
              <strong>Objection:</strong> object to processing based on legitimate interests.
            </li>
            <li>
              <strong>Restriction:</strong> ask us to limit processing in certain circumstances.
            </li>
          </ul>
          <p className="text-sm leading-relaxed">
            To exercise any right, email{' '}
            <a
              href="mailto:dpo@pilgrimcompare.co.uk"
              className="underline text-[var(--accent)]"
            >
              dpo@pilgrimcompare.co.uk
            </a>. We will respond within one month.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">7. Complaints to the ICO</h2>
          <p className="text-sm leading-relaxed">
            You have the right to complain to the Information Commissioner&apos;s Office (ICO)
            if you believe we have not handled your personal data lawfully. Visit{' '}
            <a
              href="https://ico.org.uk/make-a-complaint"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              ico.org.uk/make-a-complaint
            </a>{' '}
            or call 0303 123 1113. We ask that you contact us first so we can try to resolve
            your concern.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">8. Cookies and analytics</h2>
          <p className="mb-3 text-sm leading-relaxed">
            <strong>Analytics:</strong> We use Vercel Web Analytics, a privacy-first service
            that collects no personal data and uses no cookies. It measures page views and
            aggregate traffic patterns only, with no cross-site tracking or personal
            identifiers. No cookie consent is required for Vercel Web Analytics.
          </p>
          <p className="mb-3 text-sm leading-relaxed">
            <strong>Strictly necessary cookies:</strong> We use one session cookie for
            authentication (Supabase Auth). No consent is required for strictly necessary
            cookies.
          </p>
          <table className="w-full text-left text-sm mt-3 border border-[var(--borderSubtle)]">
            <thead className="bg-[var(--surface)]">
              <tr>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Cookie</th>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Purpose</th>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Type</th>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2">Auth session (Supabase)</td>
                <td className="px-3 py-2">Authentication and session management</td>
                <td className="px-3 py-2">Strictly necessary</td>
                <td className="px-3 py-2">Session + 7-day refresh token</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-sm leading-relaxed">
            We do not use tracking cookies, advertising cookies, or third-party analytics
            cookies. If this changes, we will update this policy and obtain your consent first
            where required.
          </p>
        </section>

        <p className="mt-12 text-xs text-[var(--textMuted)]">
          Governed by the laws of England and Wales. Written under UK GDPR and the Data Protection Act 2018.
        </p>
      </div>
    </div>
  );
}
