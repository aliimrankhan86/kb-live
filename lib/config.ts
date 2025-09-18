export const config = {
  app: {
    name: 'KaabaTrip',
    description: 'Your Journey to the Holy Land',
    url: 'https://kaabatrip.com',
  },
  features: {
    hajj: true,
    umrah: true,
    partnerProgram: true,
    userAuth: false, // Will be enabled later
  },
  seo: {
    defaultTitle: 'KaabaTrip - Your Journey to the Holy Land',
    titleTemplate: '%s | KaabaTrip',
  },
} as const

export type Config = typeof config
