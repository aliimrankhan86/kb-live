export const LEGAL_ENTITY_BLOCK = {
  companyName: 'Paramount Consultants Limited',
  tradingName: 'PilgrimCompare',
  companyNumber: '09679002',
  vatNumber: 'GB 221 6154 46',
  registeredCountry: 'England and Wales',
  contactEmail: 'support@pilgrimcompare.co.uk',
} as const;

/**
 * Registered office address (standards §2: statutory, launch-blocking).
 * THE single config value for it. Deliberately UNSET: it must come from the
 * founder and is never invented, guessed or filled in. While unset, the
 * footer, Terms and Privacy pages omit the line (and the overnight report
 * flags it). Set it to the exact address to show it everywhere.
 */
export const REGISTERED_OFFICE: string | undefined = undefined;

/** ", registered office {address}" when set, otherwise nothing. */
export const registeredOfficeClause = (office: string | undefined = REGISTERED_OFFICE): string =>
  office && office.trim() ? `, registered office ${office.trim()}` : '';

export type LegalEntityBlock = typeof LEGAL_ENTITY_BLOCK;
