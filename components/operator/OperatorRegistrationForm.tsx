'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Repository } from '@/lib/api/repository';
import { useRouter } from 'next/navigation';

const COUNTRIES = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'IE', label: 'Ireland' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IN', label: 'India' },
];

const REGIONS = ['UK', 'EU', 'US', 'ME', 'SA', 'ASIA'];

const AIRPORTS = [
  { code: 'LHR', name: 'London Heathrow' },
  { code: 'MAN', name: 'Manchester' },
  { code: 'BHX', name: 'Birmingham' },
  { code: 'BRS', name: 'Bristol' },
  { code: 'EDI', name: 'Edinburgh' },
  { code: 'GLA', name: 'Glasgow' },
  { code: 'LTN', name: 'London Luton' },
  { code: 'STN', name: 'London Stansted' },
  { code: 'LGW', name: 'London Gatwick' },
  { code: 'NCL', name: 'Newcastle' },
  { code: 'LBA', name: 'Leeds Bradford' },
  { code: 'LPL', name: 'Liverpool' },
];

interface FormErrors {
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  officeAddressLine1?: string;
  officeAddressCity?: string;
  officeAddressPostcode?: string;
  officeAddressCountry?: string;
  servingRegions?: string;
  pilgrimageTypes?: string;
  atolAbtaAcknowledged?: string;
}

export function OperatorRegistrationForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    tradingName: '',
    companyRegistrationNumber: '',
    atolNumber: '',
    abtaMemberNumber: '',
    contactEmail: '',
    contactPhone: '',
    officeAddressLine1: '',
    officeAddressLine2: '',
    officeAddressCity: '',
    officeAddressPostcode: '',
    officeAddressCountry: 'GB',
    servingRegions: [] as string[],
    departureAirports: [] as string[],
    pilgrimageTypes: [] as ('umrah' | 'hajj')[],
    websiteUrl: '',
    yearsInBusiness: '',
    atolAbtaAcknowledged: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.companyName.trim() || form.companyName.trim().length < 2) {
      next.companyName = 'Company name is required (min 2 characters)';
    }
    if (!form.contactEmail.trim()) {
      next.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      next.contactEmail = 'Enter a valid email address';
    }
    if (!form.contactPhone.trim()) {
      next.contactPhone = 'Contact phone is required';
    }
    if (!form.officeAddressLine1.trim()) {
      next.officeAddressLine1 = 'Address line 1 is required';
    }
    if (!form.officeAddressCity.trim()) {
      next.officeAddressCity = 'City is required';
    }
    if (!form.officeAddressPostcode.trim()) {
      next.officeAddressPostcode = 'Postcode is required';
    }
    if (!form.officeAddressCountry) {
      next.officeAddressCountry = 'Country is required';
    }
    if (form.servingRegions.length === 0) {
      next.servingRegions = 'Select at least one region';
    }
    if (form.pilgrimageTypes.length === 0) {
      next.pilgrimageTypes = 'Select at least one pilgrimage type';
    }
    if (!form.atolAbtaAcknowledged) {
      next.atolAbtaAcknowledged = 'You must acknowledge the ATOL/ABTA protection status';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      // Simulate a context for registration (in production this would come from auth)
      const ctx = { userId: 'new-operator-' + Date.now(), role: 'operator' as const };

      await Repository.createOperator(ctx, {
        companyName: form.companyName.trim(),
        tradingName: form.tradingName.trim() || undefined,
        companyRegistrationNumber: form.companyRegistrationNumber.trim() || undefined,
        atolNumber: form.atolNumber.trim() || undefined,
        abtaMemberNumber: form.abtaMemberNumber.trim() || undefined,
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        officeAddress: {
          line1: form.officeAddressLine1.trim(),
          line2: form.officeAddressLine2.trim() || undefined,
          city: form.officeAddressCity.trim(),
          postcode: form.officeAddressPostcode.trim(),
          country: form.officeAddressCountry,
        },
        servingRegions: form.servingRegions,
        departureAirports: form.departureAirports,
        pilgrimageTypesOffered: form.pilgrimageTypes,
        websiteUrl: form.websiteUrl.trim() || undefined,
        yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : undefined,
      });

      router.push('/operator/onboarding/status');
    } catch {
      alert('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRegion = (region: string) => {
    setForm((prev) => ({
      ...prev,
      servingRegions: prev.servingRegions.includes(region)
        ? prev.servingRegions.filter((r) => r !== region)
        : [...prev.servingRegions, region],
    }));
    if (errors.servingRegions) setErrors((prev) => ({ ...prev, servingRegions: undefined }));
  };

  const toggleAirport = (code: string) => {
    setForm((prev) => ({
      ...prev,
      departureAirports: prev.departureAirports.includes(code)
        ? prev.departureAirports.filter((a) => a !== code)
        : [...prev.departureAirports, code],
    }));
  };

  const togglePilgrimageType = (type: 'umrah' | 'hajj') => {
    setForm((prev) => ({
      ...prev,
      pilgrimageTypes: prev.pilgrimageTypes.includes(type)
        ? prev.pilgrimageTypes.filter((t) => t !== type)
        : [...prev.pilgrimageTypes, type],
    }));
    if (errors.pilgrimageTypes) setErrors((prev) => ({ ...prev, pilgrimageTypes: undefined }));
  };

  return (
    <div className="space-y-6" data-testid="operator-registration-form">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Company Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Company name *"
            value={form.companyName}
            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
            errorMessage={errors.companyName}
            data-testid="reg-company-name"
            aria-required="true"
          />
          <Input
            label="Trading name"
            value={form.tradingName}
            onChange={(e) => setForm((p) => ({ ...p, tradingName: e.target.value }))}
            data-testid="reg-trading-name"
          />
          <Input
            label="Company registration number"
            value={form.companyRegistrationNumber}
            onChange={(e) => setForm((p) => ({ ...p, companyRegistrationNumber: e.target.value }))}
            data-testid="reg-reg-number"
          />
          <Input
            label="ATOL number"
            value={form.atolNumber}
            onChange={(e) => setForm((p) => ({ ...p, atolNumber: e.target.value }))}
            data-testid="reg-atol"
          />
          <Input
            label="ABTA member number"
            value={form.abtaMemberNumber}
            onChange={(e) => setForm((p) => ({ ...p, abtaMemberNumber: e.target.value }))}
            data-testid="reg-abta"
          />
          <Input
            label="Website URL"
            type="url"
            value={form.websiteUrl}
            onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
            data-testid="reg-website"
          />
          <Input
            label="Years in business"
            type="number"
            min={0}
            value={form.yearsInBusiness}
            onChange={(e) => setForm((p) => ({ ...p, yearsInBusiness: e.target.value }))}
            data-testid="reg-years"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Contact email *"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
            errorMessage={errors.contactEmail}
            data-testid="reg-email"
            aria-required="true"
          />
          <Input
            label="Contact phone *"
            type="tel"
            value={form.contactPhone}
            onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
            errorMessage={errors.contactPhone}
            data-testid="reg-phone"
            aria-required="true"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Office Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Address line 1 *"
              value={form.officeAddressLine1}
              onChange={(e) => setForm((p) => ({ ...p, officeAddressLine1: e.target.value }))}
              errorMessage={errors.officeAddressLine1}
              data-testid="reg-address-line1"
              aria-required="true"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Address line 2"
              value={form.officeAddressLine2}
              onChange={(e) => setForm((p) => ({ ...p, officeAddressLine2: e.target.value }))}
              data-testid="reg-address-line2"
            />
          </div>
          <Input
            label="City *"
            value={form.officeAddressCity}
            onChange={(e) => setForm((p) => ({ ...p, officeAddressCity: e.target.value }))}
            errorMessage={errors.officeAddressCity}
            data-testid="reg-city"
            aria-required="true"
          />
          <Input
            label="Postcode *"
            value={form.officeAddressPostcode}
            onChange={(e) => setForm((p) => ({ ...p, officeAddressPostcode: e.target.value }))}
            errorMessage={errors.officeAddressPostcode}
            data-testid="reg-postcode"
            aria-required="true"
          />
          <div className="sm:col-span-2">
            <Select
              label="Country *"
              options={[{ value: '', label: 'Select country' }, ...COUNTRIES]}
              value={form.officeAddressCountry}
              onChange={(e) => setForm((p) => ({ ...p, officeAddressCountry: e.target.value }))}
              errorMessage={errors.officeAddressCountry}
              data-testid="reg-country"
              aria-required="true"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Serving Regions *</h2>
        {errors.servingRegions && <p className="text-xs text-[var(--danger)]">{errors.servingRegions}</p>}
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <label
              key={region}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                form.servingRegions.includes(region)
                  ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                  : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.servingRegions.includes(region)}
                onChange={() => toggleRegion(region)}
                data-testid={`reg-region-${region}`}
              />
              {region}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Departure Airports</h2>
        <div className="flex flex-wrap gap-2">
          {AIRPORTS.map((airport) => (
            <label
              key={airport.code}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                form.departureAirports.includes(airport.code)
                  ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                  : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.departureAirports.includes(airport.code)}
                onChange={() => toggleAirport(airport.code)}
                data-testid={`reg-airport-${airport.code}`}
              />
              {airport.code} — {airport.name}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Pilgrimage Types Offered *</h2>
        {errors.pilgrimageTypes && <p className="text-xs text-[var(--danger)]">{errors.pilgrimageTypes}</p>}
        <div className="flex flex-wrap gap-2">
          {(['umrah', 'hajj'] as const).map((type) => (
            <label
              key={type}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                form.pilgrimageTypes.includes(type)
                  ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                  : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.pilgrimageTypes.includes(type)}
                onChange={() => togglePilgrimageType(type)}
                data-testid={`reg-type-${type}`}
              />
              {type}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,211,29,0.04)] p-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Financial Protection Disclosure</h2>
        <p className="text-sm text-[var(--textMuted)]">
          UK law requires travel organisers selling package holidays to provide financial protection for customers.
          ATOL (Air Travel Organiser{'\''}s Licence) and ABTA membership are the primary forms of protection for UK travellers.
        </p>

        <div className="space-y-3 text-sm text-[var(--textMuted)]">
          <div className="flex items-start gap-2">
            <span aria-hidden="true" className="text-[var(--success)] font-bold">✓</span>
            <span>
              <strong className="text-[var(--text)]">ATOL protected</strong> — Customers receive a certificate and are protected if the company fails.
              Required if selling flights plus accommodation/transport.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span aria-hidden="true" className="text-[var(--success)] font-bold">✓</span>
            <span>
              <strong className="text-[var(--text)]">ABTA member</strong> — Customers can book with confidence and access dispute resolution.
              Covers non-flight packages and Linked Travel Arrangements.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span aria-hidden="true" className="text-[var(--danger)] font-bold">✗</span>
            <span>
              <strong className="text-[var(--text)]">No protection</strong> — If you do not hold ATOL or ABTA, you must clearly state this.
              KaabaTrip will display a prominent warning on your listings so travellers can make an informed choice.
            </span>
          </div>
        </div>

        <div className="rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-3 text-xs text-[var(--textMuted)]">
          <p className="font-medium text-[var(--text)]">Your responsibility</p>
          <p className="mt-1">
            You are solely responsible for ensuring your business holds appropriate financial protection for the services you offer.
            KaabaTrip displays the information you provide for traveller transparency only.
            We are not responsible for verifying the validity of your ATOL or ABTA credentials,
            nor are we liable if your protection status changes or lapses.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[var(--yellow)]"
            checked={form.atolAbtaAcknowledged}
            onChange={(e) => setForm((p) => ({ ...p, atolAbtaAcknowledged: e.target.checked }))}
            data-testid="reg-atol-abta-ack"
          />
          <span className="text-sm text-[var(--textMuted)]">
            I confirm that I understand ATOL/ABTA requirements and that KaabaTrip will display my protection status
            (or lack thereof) prominently to travellers. I accept that KaabaTrip is not responsible for verifying
            my credentials or for any claims arising from my financial protection status.
          </span>
        </label>
        {errors.atolAbtaAcknowledged && (
          <p className="text-xs text-[var(--danger)]" role="alert">{errors.atolAbtaAcknowledged}</p>
        )}
      </section>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          data-testid="reg-submit"
          className="w-full sm:w-auto"
        >
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </Button>
      </div>
    </div>
  );
}