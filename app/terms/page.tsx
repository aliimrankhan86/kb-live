import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'PilgrimCompare Terms and Conditions. UK travel comparison platform terms covering booking, payments, ATOL/ABTA, consumer rights, and data protection.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold">Terms & Conditions</h1>
        <p className="mb-8 text-sm text-[var(--textMuted)]">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; Version: 1.0
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">1. About PilgrimCompare</h2>
          <p className="mb-3 text-sm leading-relaxed">
          PilgrimCompare Limited (&ldquo;PilgrimCompare&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a UK-registered travel comparison
          platform. Our registered office is at Slough, Berkshire, United Kingdom.
          Company registration number: [Registration in progress].
          </p>
          <p className="text-sm leading-relaxed">
            <strong>Important:</strong> PilgrimCompare is a comparison platform only. We do not
            organise, sell, or fulfil travel packages. Your contract for any travel package
            is directly with the travel operator you select. We do not collect, hold, or
            transfer customer funds.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">2. Definitions</h2>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              <strong>&ldquo;Platform&rdquo;</strong> means the PilgrimCompare website and any related
              services.
            </li>
            <li>
              <strong>&ldquo;Operator&rdquo;</strong> means a travel company listed on our platform
              that offers pilgrimage packages.
            </li>
            <li>
              <strong>&ldquo;Traveller&rdquo;</strong> or <strong>&ldquo;Customer&rdquo;</strong> means a person
              using our platform to search for or request quotes for pilgrimage packages.
            </li>
            <li>
              <strong>&ldquo;Booking Intent&rdquo;</strong> means a non-binding expression of
              interest submitted by a traveller to an operator via our platform.
            </li>
            <li>
              <strong>&ldquo;Quote Request&rdquo;</strong> means a request for pricing and package
              information submitted by a traveller.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">3. Platform nature and limitations</h2>
          <p className="mb-3 text-sm leading-relaxed">
            PilgrimCompare acts solely as an intermediary comparison platform. We:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>Do not verify ATOL or ABTA credentials independently.</li>
            <li>Do not guarantee the accuracy of operator listings or pricing.</li>
            <li>Do not guarantee availability of any package.</li>
            <li>Do not set or enforce operator cancellation or refund policies.</li>
            <li>Do not collect, hold, or transfer customer payments.</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed">
            All payments are made directly between the traveller and the operator.
            PilgrimCompare is not party to any contract between a traveller and an operator.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">4. ATOL and ABTA protection</h2>
          <p className="mb-3 text-sm leading-relaxed">
            Where operators display ATOL or ABTA numbers on our platform, this information
            is provided by the operator. PilgrimCompare does not independently verify these
            credentials.
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              <strong>ATOL (Air Travel Organiser&apos;s Licence):</strong> Issued by the UK
              Civil Aviation Authority (CAA). Provides financial protection for flight-based
              packages. Verify at{' '}
              <a
                href="https://www.caa.co.uk/atol-protection"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[var(--accent)]"
              >
                caa.co.uk/atol-protection
              </a>.
            </li>
            <li>
              <strong>ABTA (Association of British Travel Agents):</strong> Membership
              indicates adherence to ABTA&apos;s Code of Conduct. Verify at{' '}
              <a
                href="https://www.abta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[var(--accent)]"
              >
                abta.com
              </a>.
            </li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-[var(--textWarning)]">
            <strong>Warning:</strong> If an operator does not display ATOL or ABTA
            protection, your booking may not be financially protected. Always confirm
            protection details directly with the operator before paying.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">5. Traveller obligations</h2>
          <p className="mb-3 text-sm leading-relaxed">
            By using our platform, you agree to:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>Provide accurate and truthful information in quote requests.</li>
            <li>Be at least 16 years of age, or have parental/guardian consent.</li>
            <li>Verify ATOL/ABTA protection directly with the operator before booking.</li>
            <li>Confirm all package details, inclusions, and terms directly with the operator.</li>
            <li>Make payments directly to the operator, not to PilgrimCompare.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">6. Operator obligations</h2>
          <p className="mb-3 text-sm leading-relaxed">
            Operators listed on our platform agree to:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>Provide accurate and up-to-date company and package information.</li>
            <li>Display valid ATOL and/or ABTA numbers where applicable.</li>
            <li>Respond to quote requests in a timely and professional manner.</li>
            <li>Handle all payments, refunds, and cancellations directly with travellers.</li>
            <li>Comply with all applicable UK laws, including the Package Travel Regulations 2018.</li>
            <li>
              Acknowledge that PilgrimCompare does not verify credentials and that they are
              solely responsible for their financial protection status.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">7. Booking reference and payment</h2>
          <p className="mb-3 text-sm leading-relaxed">
            The booking process on PilgrimCompare works as follows:
          </p>
          <ol className="list-decimal pl-5 text-sm leading-relaxed space-y-1">
            <li>You submit a quote request with your travel preferences.</li>
            <li>Verified operators may respond with offers.</li>
            <li>You select an offer and submit a Booking Intent (non-binding).</li>
            <li>The operator provides payment instructions directly.</li>
            <li>You pay the operator directly. PilgrimCompare is not involved in the payment and takes no commission.</li>
          </ol>
          <p className="mt-3 text-sm leading-relaxed">
            <strong>Important — Your PilgrimCompare reference:</strong> When you submit a Booking Intent,
            PilgrimCompare issues a unique reference code (e.g., KT-XXXXX). You must provide this reference
            to the operator when making payment. If you do not provide our reference, we cannot verify
            that the booking originated through our platform. In such cases, any dispute is a matter
            between you and the operator directly. PilgrimCompare will not be able to offer assistance,
            mediation, or complaint routing.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            All prices shown are in GBP (£) unless otherwise stated. Prices may be marked
            as &ldquo;exact&rdquo;, &ldquo;from&rdquo;, or &ldquo;fixed&rdquo;. A &ldquo;from&rdquo; price indicates the starting
            price and the actual cost may vary based on your specific requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">8. Cancellations and refunds</h2>
          <p className="mb-3 text-sm leading-relaxed">
            Cancellation and refund terms are determined by the individual operator and
            must be confirmed before payment. PilgrimCompare does not process cancellations or
            refunds.
          </p>
          <p className="text-sm leading-relaxed">
            Under the Package Travel Regulations 2018, you may have statutory rights to
            cancel in certain circumstances. These rights are between you and the operator.
            For more information, visit the{' '}
            <a
              href="https://www.citizensadvice.org.uk/consumer/holiday-cancellations/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              Citizens Advice website
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">9. Complaints</h2>
          <p className="mb-3 text-sm leading-relaxed">
            If you have a complaint about an operator or your booking:
          </p>
          <ol className="list-decimal pl-5 text-sm leading-relaxed space-y-1">
            <li>First, contact the operator directly to resolve the issue.</li>
            <li>
              If unresolved, you may submit a complaint via our platform (for logged-in
              users with an active Booking Intent).
            </li>
            <li>
              We will route your complaint to the operator and, where necessary, to our
              admin team for triage.
            </li>
            <li>
              PilgrimCompare logs and routes complaints but does not adjudicate disputes or
              enforce resolutions.
            </li>
          </ol>
          <p className="mt-3 text-sm leading-relaxed">
            For ABTA members, you may also use the ABTA arbitration scheme. For ATOL
            holders, contact the CAA. For general consumer advice, contact{' '}
            <a
              href="https://www.citizensadvice.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              Citizens Advice
            </a>{' '}
            or{' '}
            <a
              href="https://www.tradingstandards.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[var(--accent)]"
            >
              Trading Standards
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">10. Marketing and data use</h2>
          <p className="mb-3 text-sm leading-relaxed">
            We collect and store your contact details and travel preferences to operate
            our platform and match you with operators.
          </p>
          <p className="mb-3 text-sm leading-relaxed">
            <strong>Marketing:</strong> We will only send you promotional emails about
            new packages, deals, or platform updates if you have given explicit consent.
            You can opt in during sign-up or in your account settings. You can withdraw
            consent at any time by emailing{' '}
            <a href="mailto:privacy@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">
              privacy@pilgrimcompare.co.uk
            </a>{' '}
            or clicking the unsubscribe link in any marketing email.
          </p>
          <p className="text-sm leading-relaxed">
            We retain your data in accordance with our{' '}
            <Link href="/privacy" className="underline text-[var(--accent)]">Privacy Policy</Link>.
            Marketing consent records are retained indefinitely as proof of consent
            under UK GDPR.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">11. Cookies</h2>
          <p className="mb-3 text-sm leading-relaxed">
            We use cookies in accordance with the Privacy and Electronic Communications
            Regulations (PECR) and UK GDPR. By using our platform, you consent to our
            use of cookies as described below.
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
              <tr className="border-b border-[var(--borderSubtle)]">
                <td className="px-3 py-2">kb_session</td>
                <td className="px-3 py-2">Authentication and session management</td>
                <td className="px-3 py-2">Essential</td>
                <td className="px-3 py-2">Session + 7 days refresh</td>
              </tr>
              <tr>
                <td className="px-3 py-2">kb_cookie_consent_v1</td>
                <td className="px-3 py-2">Records your cookie consent choices</td>
                <td className="px-3 py-2">Essential</td>
                <td className="px-3 py-2">1 year</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-sm leading-relaxed">
            Analytics cookies will be added post-MVP and will require separate consent.
            You can manage your cookie preferences via the cookie banner or by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">12. Intellectual property</h2>
          <p className="text-sm leading-relaxed">
            All content on the PilgrimCompare platform, including text, graphics, logos, and
            software, is the property of PilgrimCompare Limited or its licensors and is
            protected by UK and international copyright laws. You may not reproduce,
            distribute, or create derivative works without our express written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">13. Limitation of liability</h2>
          <p className="mb-3 text-sm leading-relaxed">
            To the maximum extent permitted by law:
          </p>
          <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
            <li>
              PilgrimCompare is not liable for any loss, damage, or expense arising from your
              use of the platform or any travel package booked through an operator.
            </li>
            <li>
              We do not guarantee the quality, safety, or legality of any operator&apos;s
              services.
            </li>
            <li>
              Our total liability to you for any claim arising from your use of the
              platform shall not exceed £100.
            </li>
            <li>
              Nothing in these terms excludes or limits our liability for death or
              personal injury caused by our negligence, fraud, or any other liability
              that cannot be excluded under UK law.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">14. Account suspension and termination</h2>
          <p className="text-sm leading-relaxed">
            We reserve the right to suspend or terminate your account at any time if we
            believe you have violated these terms, engaged in fraudulent activity, or
            pose a risk to other users or the platform. Operators may have their
            verification status revoked for misrepresentation or failure to comply with
            UK consumer law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">15. Governing law and jurisdiction</h2>
          <p className="text-sm leading-relaxed">
            These Terms & Conditions are governed by the laws of England and Wales.
            Any dispute arising from these terms or your use of the platform shall be
            subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">16. Changes to these terms</h2>
          <p className="text-sm leading-relaxed">
            We may update these Terms & Conditions from time to time. We will notify
            you of significant changes via email or a prominent notice on the platform.
            Continued use of the platform after changes constitutes acceptance of the
            revised terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">17. Contact us</h2>
          <p className="text-sm leading-relaxed">
            For any questions about these Terms & Conditions, please contact us:
          </p>
          <address className="mt-3 text-sm not-italic leading-relaxed text-[var(--textMuted)]">
            PilgrimCompare Limited<br />
            Slough, Berkshire<br />
            United Kingdom<br />
            Email: <a href="mailto:support@pilgrimcompare.co.uk" className="underline text-[var(--accent)]">support@pilgrimcompare.co.uk</a>
          </address>
        </section>

        <p className="mt-12 text-xs text-[var(--textMuted)]">
          These Terms & Conditions are governed by the laws of England and Wales.
          By using the PilgrimCompare platform, you acknowledge that you have read,
          understood, and agree to be bound by these terms.
        </p>
      </div>
    </main>
  );
}