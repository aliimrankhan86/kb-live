import type { Package, QuoteRequest } from '@/lib/types'

const toNumber = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const toBoolean = (value: string | null) => {
  if (value === null) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

const normalizeSeason = (pkg: Package): QuoteRequest['season'] => {
  if (pkg.pilgrimageType === 'hajj') return 'hajj'
  if (pkg.seasonLabel?.toLowerCase().includes('ramadan')) return 'ramadan'
  return 'flexible'
}

const normalizeDistance = (band: Package['distanceBandMakkah']): QuoteRequest['distancePreference'] => {
  if (band === 'near' || band === 'medium' || band === 'far') return band
  return 'medium'
}

const buildBudgetRange = (pkg: Package): NonNullable<QuoteRequest['budgetRange']> => {
  const min = pkg.pricePerPerson
  const max = Math.round((pkg.pricePerPerson * 1.5) / 100) * 100
  return { min, max, currency: pkg.currency }
}

export const createQuotePrefillUrl = (pkg: Package) => {
  const params = new URLSearchParams()
  params.set('type', pkg.pilgrimageType)
  params.set('season', normalizeSeason(pkg))

  if (pkg.dateWindow?.start) params.set('start', pkg.dateWindow.start)
  if (pkg.dateWindow?.end) params.set('end', pkg.dateWindow.end)

  params.set('totalNights', String(pkg.totalNights))
  params.set('nightsMakkah', String(pkg.nightsMakkah))
  params.set('nightsMadinah', String(pkg.nightsMadinah))

  const hotelStars = pkg.hotelMakkahStars ?? pkg.hotelMadinahStars ?? 4
  params.set('hotelStars', String(hotelStars))
  params.set('distancePreference', normalizeDistance(pkg.distanceBandMakkah))

  params.set('visa', String(pkg.inclusions?.visa ?? true))
  params.set('flights', String(pkg.inclusions?.flights ?? true))
  params.set('transfers', String(pkg.inclusions?.transfers ?? true))
  params.set('meals', String(pkg.inclusions?.meals ?? true))

  const budget = buildBudgetRange(pkg)
  params.set('budgetMin', String(budget.min))
  params.set('budgetMax', String(budget.max))
  params.set('currency', budget.currency)

  return `/quote?${params.toString()}`
}

export const parseQuotePrefillParams = (
  params: URLSearchParams
): Partial<QuoteRequest> => {
  const type = params.get('type')
  const season = params.get('season')
  const start = params.get('start')
  const end = params.get('end')

  const totalNights = toNumber(params.get('totalNights'))
  const nightsMakkah = toNumber(params.get('nightsMakkah'))
  const nightsMadinah = toNumber(params.get('nightsMadinah'))
  const hotelStars = toNumber(params.get('hotelStars'))
  const distancePreference = params.get('distancePreference')

  const visa = toBoolean(params.get('visa'))
  const flights = toBoolean(params.get('flights'))
  const transfers = toBoolean(params.get('transfers'))
  const meals = toBoolean(params.get('meals'))

  const budgetMin = toNumber(params.get('budgetMin'))
  const budgetMax = toNumber(params.get('budgetMax'))
  const currency = params.get('currency')

  const draft: Partial<QuoteRequest> = {}

  if (type === 'umrah' || type === 'hajj') draft.type = type
  if (
    season === 'ramadan' ||
    season === 'hajj' ||
    season === 'school-holidays' ||
    season === 'flexible' ||
    season === 'custom'
  ) {
    draft.season = season
  }

  if (start || end) {
    draft.dateWindow = { start: start ?? undefined, end: end ?? undefined, flexible: false }
  } else if (type || season) {
    draft.dateWindow = { flexible: true }
  }

  if (typeof totalNights === 'number') draft.totalNights = totalNights
  if (typeof nightsMakkah === 'number') draft.nightsMakkah = nightsMakkah
  if (typeof nightsMadinah === 'number') draft.nightsMadinah = nightsMadinah
  if (typeof hotelStars === 'number' && [3, 4, 5].includes(hotelStars)) {
    draft.hotelStars = hotelStars as QuoteRequest['hotelStars']
  }

  if (distancePreference === 'near' || distancePreference === 'medium' || distancePreference === 'far') {
    draft.distancePreference = distancePreference
  }

  if (visa !== undefined || flights !== undefined || transfers !== undefined || meals !== undefined) {
    draft.inclusions = {
      visa: visa ?? true,
      flights: flights ?? true,
      transfers: transfers ?? true,
      meals: meals ?? true,
    }
  }

  if (typeof budgetMin === 'number' && typeof budgetMax === 'number') {
    draft.budgetRange = {
      min: budgetMin,
      max: budgetMax,
      currency: currency ?? 'GBP',
    }
  }

  return draft
}
