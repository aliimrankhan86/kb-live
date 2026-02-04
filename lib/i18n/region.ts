export type Region = 'UK' | 'EU' | 'US' | 'CA' | 'UAE'
export type DistanceUnit = 'miles' | 'km'

export interface RegionSettings {
  region: Region
  locale: string
  currency: string
  distanceUnit: DistanceUnit
}

const REGION_SETTINGS: Record<Region, Omit<RegionSettings, 'region'>> = {
  UK: { locale: 'en-GB', currency: 'GBP', distanceUnit: 'miles' },
  EU: { locale: 'fr-FR', currency: 'EUR', distanceUnit: 'km' },
  US: { locale: 'en-US', currency: 'USD', distanceUnit: 'miles' },
  CA: { locale: 'en-CA', currency: 'CAD', distanceUnit: 'km' },
  UAE: { locale: 'ar-AE', currency: 'AED', distanceUnit: 'km' },
}

const normalizeLocale = (locale?: string) => (locale ?? '').trim().toLowerCase()

export const detectRegion = (locale?: string, timeZone?: string): Region => {
  const normalized = normalizeLocale(locale)
  const tz = (timeZone ?? '').toLowerCase()

  if (normalized.startsWith('ar-ae')) return 'UAE'
  if (tz.includes('dubai') || tz.includes('abu dhabi') || tz.includes('abu_dhabi')) return 'UAE'
  if (normalized.startsWith('fr')) return 'EU'
  if (normalized.startsWith('en-us')) return 'US'
  if (normalized.startsWith('en-ca')) return 'CA'
  if (normalized.startsWith('en-gb')) return 'UK'
  return 'UK'
}

export const getRegionSettings = (options?: { locale?: string; timeZone?: string }): RegionSettings => {
  const locale =
    options?.locale ?? (typeof navigator !== 'undefined' ? navigator.language : undefined)
  const timeZone =
    options?.timeZone ??
    (typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined)
  const region = detectRegion(locale, timeZone)
  const settings = REGION_SETTINGS[region]
  return {
    region,
    locale: locale ?? settings.locale,
    currency: settings.currency,
    distanceUnit: settings.distanceUnit,
  }
}
