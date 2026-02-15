import { RegionSettings } from './region'

const GBP_RATES: Record<string, number> = {
  USD: 1.27,
  EUR: 1.17,
  CAD: 1.72,
  AED: 4.67,
}

export const formatMoney = (
  amount: number,
  currency: string,
  locale: string,
  maximumFractionDigits = 0
) => {
  if (!Number.isFinite(amount)) return 'Not provided'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
  if (!Number.isFinite(amount)) return null
  if (fromCurrency === toCurrency) return amount
  if (fromCurrency === 'GBP' && GBP_RATES[toCurrency]) {
    return amount * GBP_RATES[toCurrency]
  }
  if (toCurrency === 'GBP' && GBP_RATES[fromCurrency]) {
    return amount / GBP_RATES[fromCurrency]
  }
  return null
}

export const formatPriceForRegion = (
  amount: number,
  currency: string,
  settings: RegionSettings
) => {
  const converted = convertCurrency(amount, currency, settings.currency)
  const displayAmount = converted ?? amount
  const displayCurrency = converted ? settings.currency : currency
  return {
    amount: displayAmount,
    currency: displayCurrency,
    formatted: formatMoney(displayAmount, displayCurrency, settings.locale),
  }
}

export const parseDistanceKm = (raw: string | null | undefined): number | null => {
  if (!raw) return null
  const normalized = raw.trim().toLowerCase()
  const match = normalized.match(/([0-9]*\.?[0-9]+)\s*(km|kilometer|kilometre|m|meter|metre|mi|mile|miles)/)
  if (!match) return null
  const value = Number.parseFloat(match[1])
  if (!Number.isFinite(value)) return null
  const unit = match[2]
  if (unit === 'm' || unit === 'meter' || unit === 'metre') {
    return value / 1000
  }
  if (unit === 'mi' || unit === 'mile' || unit === 'miles') {
    return value / 0.621371
  }
  return value
}

export const formatDistance = (valueKm: number, unitPreference: 'miles' | 'km') => {
  if (!Number.isFinite(valueKm)) return 'Not provided'
  if (unitPreference === 'miles') {
    const miles = valueKm * 0.621371
    const formatted = miles < 10 ? miles.toFixed(1) : `${Math.round(miles)}`
    return `${formatted} mi`
  }
  const formatted = valueKm < 10 ? valueKm.toFixed(1) : `${Math.round(valueKm)}`
  return `${formatted} km`
}
