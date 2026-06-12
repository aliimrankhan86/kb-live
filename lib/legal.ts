export const LEGAL_ENTITY_BLOCK = {
  companyName: 'Paramount Consultants Limited',
  tradingName: 'PilgrimCompare',
  companyNumber: '09679002',
  vatNumber: 'GB 221 6154 46',
  registeredCountry: 'England and Wales',
  contactEmail: 'support@pilgrimcompare.co.uk',
  // TODO: update once virtual registered office is set up — see AI_NOTES.md §14
  registeredOffice: '',
} as const;

export type LegalEntityBlock = typeof LEGAL_ENTITY_BLOCK;
