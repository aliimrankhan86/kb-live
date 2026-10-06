import { ATOL_STANDARD_LINE, PAYMENT_STANDARD_LINE } from '@/lib/content-rules'

/**
 * FAQs for the city corridor pages. Shared so every city says the same,
 * checkable things: no prices, airline routes or supply claims that PilgrimCompare
 * cannot back with live data (standards §6, §8, §11).
 */
export function corridorFaqs(city: string): { question: string; answer: string }[] {
  return [
    {
      question: `How much does an Umrah package from ${city} cost?`,
      answer: `Prices are set by each operator and depend on dates, hotels and what is included. Compare the prices operators state for packages departing from ${city}, and confirm the final price with the operator before paying.`,
    },
    {
      question: `How do I compare Umrah packages from ${city} on PilgrimCompare?`,
      answer: `Choose ${city} as your departure, add your travel dates if you know them, then compare up to 3 packages side by side. Any detail an operator has not given shows as "Not provided".`,
    },
    {
      question: 'Is my Umrah package ATOL protected?',
      answer: ATOL_STANDARD_LINE,
    },
    {
      question: 'Who do I pay?',
      answer: PAYMENT_STANDARD_LINE,
    },
  ]
}

/** Supply-neutral intro: true whether or not packages are listed today (§8). */
export const corridorIntro = (city: string) =>
  `Compare Umrah packages that verified UK operators list as departing from ${city}. See price, hotels, distance to the Haram and what is included side by side, then send an enquiry to the operator.`

export const corridorDescription = (city: string) =>
  `Compare Umrah packages departing from ${city} side by side: price, hotels, distance to the Haram and inclusions, as stated by each verified UK operator.`
