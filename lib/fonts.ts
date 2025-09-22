import localFont from 'next/font/local'

// Define your Exo 2 font family with multiple weights
export const exo2Font = localFont({
  src: [
    {
      path: '../public/fonts/Exo2-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Exo2-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Exo2-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Exo2-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Exo2-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Exo2-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Exo2-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-exo2',
  display: 'swap',
})

// Export the font variable for use in CSS
export const fontVariable = exo2Font.variable
