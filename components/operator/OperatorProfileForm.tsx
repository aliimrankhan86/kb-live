'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Repository } from '@/lib/api/repository';
import { OperatorProfile } from '@/lib/types';

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
const PILGRIMAGE_TYPES = ['umrah', 'hajj'] as const;

interface Props {
  operator: OperatorProfile;
}

function getCompletenessScore(op: OperatorProfile): number {
  let filled = 0;
  const total = 10;
  if (op.companyName) filled++;
  if (op.tradingName) filled++;
  if (op.companyRegistrationNumber) filled++;
  if (op.atolNumber) filled++;
  if (op.abtaMemberNumber) filled++;
  if (op.contactEmail) filled++;
  if (op.contactPhone) filled++;
  if (op.officeAddress?.line1) filled++;
  if (op.websiteUrl) filled++;
  if (op.yearsInBusiness) filled++;
  return Math.round((filled / total) * 100);
}

function getCompletenessHints(op: OperatorProfile): string[] {
  const hints: string[] = [];
  if (!op.atolNumber) hints.push('Add ATOL number to increase trust with travellers.');
  if (!op.abtaMemberNumber) hints.push('Add ABTA membership for extra credibility.');
  if (!op.websiteUrl) hints.push('Add a website URL for customer confidence.');
  if (!op.officeAddress?.line1) hints.push('Complete your office address.');
  return hints;
}

export function OperatorProfileForm({ operator }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    companyName: operator.companyName ?? '',
    tradingName: operator.tradingName ?? '',
    companyRegistrationNumber: operator.companyRegistrationNumber ?? '',
    atolNumber: operator.atolNumber ?? '',
    abtaMemberNumber: operator.abtaMemberNumber ?? '',
    contactEmail: operator.contactEmail ?? '',
    contactPhone: operator.contactPhone ?? '',
    officeAddressLine1: operator.officeAddress?.line1 ?? '',
    officeAddressLine2: operator.officeAddress?.line2 ?? '',
    officeAddressCity: operator.officeAddress?.city ?? '',
    officeAddressPostcode: operator.officeAddress?.postcode ?? '',
    officeAddressCountry: operator.officeAddress?.country ?? 'GB',
    websiteUrl: operator.websiteUrl ?? '',
    yearsInBusiness: operator.yearsInBusiness ? String(operator.yearsInBusiness) : '',
    servingRegions: operator.servingRegions ?? [],
    pilgrimageTypesOffered: operator.pilgrimageTypesOffered ?? [],
  });

  const profileForScore = {
    ...operator,
    ...form,
    yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : undefined,
    officeAddress: { line1: form.officeAddressLine1, line2: form.officeAddressLine2 || undefined, city: form.officeAddressCity, postcode: form.officeAddressPostcode, country: form.officeAddressCountry },
  } as unknown as OperatorProfile;
  const score = getCompletenessScore(profileForScore);
  const hints = getCompletenessHints(profileForScore);

  const handleSave = () => {
    setSaving(true);
    try {
      const ctx = { userId: operator.id, role: 'operator' as const };
      Repository.updateOperator(ctx, operator.id, {
        companyName: form.companyName.trim(),
        tradingName: form.tradingName.trim() || undefined,
        companyRegistrationNumber: form.companyRegistrationNumber.trim() || undefined,
        atolNumber: form.atolNumber.trim() || undefined,
        abtaMemberNumber: form.abtaMemberNumber.trim() || undefined,
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim() || undefined,
        officeAddress: {
          line1: form.officeAddressLine1.trim(),
          line2: form.officeAddressLine2.trim() || undefined,
          city: form.officeAddressCity.trim(),
          postcode: form.officeAddressPostcode.trim(),
          country: form.officeAddressCountry,
        },
        websiteUrl: form.websiteUrl.trim() || undefined,
        yearsInBusiness: form.yearsInBusiness ? Number(form.yearsInBusiness) : undefined,
        servingRegions: form.servingRegions,
        pilgrimageTypesOffered: form.pilgrimageTypesOffered as ('umrah' | 'hajj')[],
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRegion = (region: string) => {
    setForm((prev) => ({
      ...prev,
      servingRegions: prev.servingRegions.includes(region)
        ? prev.servingRegions.filter((r) => r !== region)
        : [...prev.servingRegions, region],
    }));
  };

  const toggleType = (type: 'umrah' | 'hajj') => {
    setForm((prev) => ({
      ...prev,
      pilgrimageTypesOffered: prev.pilgrimageTypesOffered.includes(type)
        ? prev.pilgrimageTypesOffered.filter((t) => t !== type)
        : [...prev.pilgrimageTypesOffered, type],
    }));
  };

  return (
    <div className="space-y-6" data-testid="operator-profile-form">
      <div className="rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--textMuted)]">Profile completeness</p>
            <p className="text-2xl font-semibold text-[var(--text)]">{score}%</p>
          </div>
          <Badge variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'default'}>
            {score >= 80 ? 'Complete' : score >= 50 ? 'Good' : 'Incomplete'}
          </Badge>
        </div>
        {hints.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-[var(--textMuted)]">
            {hints.slice(0, 2).map((hint) => (
              <li key={hint}>• {hint}</li>
            ))}
          </ul>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Company Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company name" value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} data-testid="profile-company-name" />
          <Input label="Trading name" value={form.tradingName} onChange={(e) => setForm((p) => ({ ...p, tradingName: e.target.value }))} data-testid="profile-trading-name" />
          <Input label="Registration number" value={form.companyRegistrationNumber} onChange={(e) => setForm((p) => ({ ...p, companyRegistrationNumber: e.target.value }))} data-testid="profile-reg-number" />
          <Input label="ATOL number" value={form.atolNumber} onChange={(e) => setForm((p) => ({ ...p, atolNumber: e.target.value }))} data-testid="profile-atol" />
          <Input label="ABTA member number" value={form.abtaMemberNumber} onChange={(e) => setForm((p) => ({ ...p, abtaMemberNumber: e.target.value }))} data-testid="profile-abta" />
          <Input label="Website URL" type="url" value={form.websiteUrl} onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))} data-testid="profile-website" />
          <Input label="Years in business" type="number" value={form.yearsInBusiness} onChange={(e) => setForm((p) => ({ ...p, yearsInBusiness: e.target.value }))} data-testid="profile-years" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Contact Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Contact email" type="email" value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} data-testid="profile-email" />
          <Input label="Contact phone" type="tel" value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} data-testid="profile-phone" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Office Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Address line 1" value={form.officeAddressLine1} onChange={(e) => setForm((p) => ({ ...p, officeAddressLine1: e.target.value }))} data-testid="profile-address-line1" />
          </div>
          <div className="sm:col-span-2">
            <Input label="Address line 2" value={form.officeAddressLine2} onChange={(e) => setForm((p) => ({ ...p, officeAddressLine2: e.target.value }))} data-testid="profile-address-line2" />
          </div>
          <Input label="City" value={form.officeAddressCity} onChange={(e) => setForm((p) => ({ ...p, officeAddressCity: e.target.value }))} data-testid="profile-city" />
          <Input label="Postcode" value={form.officeAddressPostcode} onChange={(e) => setForm((p) => ({ ...p, officeAddressPostcode: e.target.value }))} data-testid="profile-postcode" />
          <div className="sm:col-span-2">
            <Select label="Country" options={[{ value: '', label: 'Select country' }, ...COUNTRIES]} value={form.officeAddressCountry} onChange={(e) => setForm((p) => ({ ...p, officeAddressCountry: e.target.value }))} data-testid="profile-country" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Serving Regions</h2>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <label key={region} className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${form.servingRegions.includes(region) ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]' : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'}`}>
              <input type="checkbox" className="sr-only" checked={form.servingRegions.includes(region)} onChange={() => toggleRegion(region)} data-testid={`profile-region-${region}`} />
              {region}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text)]">Pilgrimage Types Offered</h2>
        <div className="flex flex-wrap gap-2">
          {PILGRIMAGE_TYPES.map((type) => (
            <label key={type} className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${form.pilgrimageTypesOffered.includes(type) ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]' : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'}`}>
              <input type="checkbox" className="sr-only" checked={form.pilgrimageTypesOffered.includes(type)} onChange={() => toggleType(type)} data-testid={`profile-type-${type}`} />
              {type}
            </label>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving} data-testid="profile-save">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        {saved && <span className="text-sm text-green-500" role="status">Saved successfully</span>}
      </div>
    </div>
  );
}