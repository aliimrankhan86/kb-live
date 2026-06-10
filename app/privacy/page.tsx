import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'PilgrimCompare Privacy Policy. How we collect, use and protect your personal data in compliance with UK GDPR and the Data Protection Act 2018.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-[var(--textMuted)]">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; Effective date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">1. Who we are</h2>
          <p className="mb-3 text-sm leading-relaxed">
            PilgrimCompare Limited (“we”, “us”, “our”) is a UK-based travel comparison platform
            registered in England and Wales. Our registered office is:
          </p>
          <address className="mb-3 text-sm not-italic leading-relaxed text-[var(--textMuted)]">
            PilgrimCompare Limited<br />
            Slough, Berkshire<br />
            United Kingdom<br />
            Email: privacy@pilgrimcompare.co.uk
          </address>
          <p className="text-sm leading-relaxed">
            For data protection purposes, PilgrimCompare Limited is the data controller of your
            personal information. Our Data Protection Officer can be reached at{' '}
            <a href="mailto:dpo@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">
              dpo@pilgrimcompare.co.uk
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">2. What data we collect</h2>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              <strong>Account data:</strong> name, email address, password hash, user role
              (customer, operator, or admin).
            </li>
            <li>
              <strong>Quote request data:</strong> travel preferences (destination, dates,
              hotel star rating, room occupancy, budget range, inclusions), departure city,
              and any notes you provide.
            </li>
            <li>
              <strong>Booking intent data:</strong> reference codes, selected offer/package,
              payment evidence metadata, and communication notes.
            </li>
            <li>
              <strong>Operator data:</strong> company name, registration number, ATOL/ABTA
              numbers, contact details, office address, service regions, and bank account
              details (for verified operators only).
            </li>
            <li>
              <strong>Complaint data:</strong> complaint descriptions, category, severity,
              and operator/admin responses.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, browser type, device information,
              and cookies (see our <Link href="/terms" className="underline text-[var(--accent)]">Terms & Conditions</Link> for cookie details).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">3. Legal basis for processing</h2>
          <p className="mb-3 text-sm leading-relaxed">
            We process your personal data under the following lawful bases under UK GDPR:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              <strong>Contract:</strong> account registration, quote requests, booking
              intents, and payment evidence handling.
            </li>
            <li>
              <strong>Legal obligation:</strong> complaint handling, audit logs, and
              financial record-keeping (7 years).
            </li>
            <li>
              <strong>Legitimate interests:</strong> operator verification for consumer
              safety, fraud prevention, and platform security.
            </li>
            <li>
              <strong>Consent:</strong> marketing communications and analytics cookies.
              You can withdraw consent at any time by emailing{' '}
              <a href="mailto:privacy@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">
                privacy@pilgrimcompare.co.uk
              </a>.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">4. How we use your data</h2>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>To provide and maintain the PilgrimCompare comparison platform.</li>
            <li>To match your quote requests with verified travel operators.</li>
            <li>To facilitate booking intents between you and your chosen operator.</li>
            <li>To process complaints and disputes in accordance with UK consumer law.</li>
            <li>To send you service-related communications (booking updates, security alerts).</li>
            <li>
              To send marketing communications <em>only</em> if you have given explicit
              consent during sign-up or via your account settings.
            </li>
            <li>To comply with legal and regulatory obligations.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">5. Data sharing</h2>
          <p className="mb-3 text-sm leading-relaxed">
            We do not sell your personal data. We share data only with:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              <strong>Travel operators:</strong> when you submit a quote request or booking
              intent, the relevant operator receives your contact details and travel
              preferences.
            </li>
            <li>
              <strong>Service providers:</strong> Supabase (cloud database, London region),
              hosting providers, and email delivery services—all under GDPR-compliant
              data processing agreements.
            </li>
            <li>
              <strong>Regulators:</strong> where required by law (e.g., ICO, CAA, ABTA,
              Trading Standards).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">6. International transfers</h2>
          <p className="text-sm leading-relaxed">
            Your data is stored in the United Kingdom (eu-west-2, London) via Supabase.
            We do not transfer personal data outside the UK or European Economic Area
            for core business operations. If we ever need to transfer data internationally,
            we will ensure adequate safeguards are in place (e.g., UK International Data
            Transfer Agreement or EU Standard Contractual Clauses).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">7. Data retention</h2>
          <table className="w-full text-left text-sm mt-3 border border-[var(--borderSubtle)]">
            <thead className="bg-[var(--surface)]">
              <tr>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Data type</th>
                <th className="px-3 py-2 border-b border-[var(--borderSubtle)]">Retention period</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">User account (active)</td>
                <td className="px-3 py-2">Indefinite (until you delete your account)</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">User account (deleted)</td>
                <td className="px-3 py-2">90 days grace, then hard-delete</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Booking intent + evidence</td>
                <td className="px-3 py-2">90 days (auto-purged unless dispute flagged)</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Audit log entries</td>
                <td className="px-3 py-2">7 years (legal/financial requirement)</td>
              </tr>
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">Complaint records</td>
                <td className="px-3 py-2">7 years (consumer protection requirement)</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Marketing consent records</td>
                <td className="px-3 py-2">Indefinite (proof of consent required)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">8. Your rights</h2>
          <p className="mb-3 text-sm leading-relaxed">
            Under UK GDPR, you have the following rights:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data (“right to be forgotten”).</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests or direct marketing.</li>
            <li><strong>Restriction:</strong> Request limited processing in certain circumstances.</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed">
            To exercise any of these rights, email us at{' '}
            <a href="mailto:privacy@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">
              privacy@pilgrimcompare.co.uk
            </a>. We will respond within one month.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">9. Cookies and tracking</h2>
          <p className="text-sm leading-relaxed">
            We use essential cookies for authentication and security, and optional analytics
            cookies to improve our service. You can manage your cookie preferences at any
            time via the cookie banner or by contacting us. See our{' '}
            <Link href="/terms" className="underline text-[var(--accent)]">Terms & Conditions</Link>{' '}
            for the full cookie table.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">10. Security</h2>
          <p className="text-sm leading-relaxed">
            We implement appropriate technical and organisational measures to protect your
            data, including TLS 1.3 encryption in transit, AES-256 encryption at rest,
            role-based access control (RBAC), Row Level Security (RLS) on our database,
            and regular security audits.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">11. Children&apos;s privacy</h2>
          <p className="text-sm leading-relaxed">
            Our platform is not intended for children under 16. We do not knowingly collect
            personal data from children. If you believe we have collected data from a child,
            please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">12. Changes to this policy</h2>
          <p className="text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes via email or a prominent notice on our platform. The
            Last updated date at the top of this page indicates when this policy was
            last revised.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">13. Contact us</h2>
          <p className="text-sm leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices,
            please contact us:
          </p>
          <address className="mt-3 text-sm not-italic leading-relaxed text-[var(--textMuted)]">
            PilgrimCompare Limited<br />
            Slough, Berkshire<br />
            United Kingdom<br />
            Email: <a href="mailto:privacy@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">privacy@pilgrimcompare.co.uk</a>
          </address>
        </section>

        <p className="mt-12 text-xs text-[var(--textMuted)]">
          This Privacy Policy is governed by the laws of England and Wales and complies
          with the UK General Data Protection Regulation (UK GDPR) and the Data Protection
          Act 2018.
        </p>
      </div>
    </main>
  );
}