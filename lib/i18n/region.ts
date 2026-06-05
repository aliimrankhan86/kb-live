export type Region = 'UK' | 'EU' | 'US' | 'CA' | 'UAE'
export type DistanceUnit = 'miles' | 'km'
export type DisplayCurrency = 'GBP' | 'USD' | 'EUR'

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

const CURRENCY_TO_REGION: Record<DisplayCurrency, Region> = {
  GBP: 'UK',
  USD: 'US',
  EUR: 'EU',
}

export const CURRENCY_STORAGE_KEY = 'kb_display_currency'
export const CURRENCY_CHANGE_EVENT = 'kb:currency-change'

export const DISPLAY_CURRENCY_OPTIONS: Array<{ value: DisplayCurrency; label: string }> = [
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
]

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

const isDisplayCurrency = (value: string | null | undefined): value is DisplayCurrency =>
  value === 'GBP' || value === 'USD' || value === 'EUR'

export const getPreferredCurrency = (): DisplayCurrency | null => {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
  return isDisplayCurrency(stored) ? stored : null
}

export const setPreferredCurrency = (currency: DisplayCurrency) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: currency }))
}

export const getRegionSettings = (options?: {
  locale?: string
  timeZone?: string
  currency?: DisplayCurrency
}): RegionSettings => {
  const preferredCurrency = options?.currency ?? getPreferredCurrency()
  if (preferredCurrency) {
    const region = CURRENCY_TO_REGION[preferredCurrency]
    const settings = REGION_SETTINGS[region]
    return {
      region,
      locale: settings.locale,
      currency: preferredCurrency,
      distanceUnit: settings.distanceUnit,
    }
  }

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
