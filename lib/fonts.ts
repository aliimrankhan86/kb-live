import localFont from 'next/font/local'

// Define your Exo 2 Light font as the primary font
export const exo2Font = localFont({
  src: [
    {
      path: '../public/fonts/Exo2-Light.ttf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-exo2',
  display: 'swap',
})

// Export the font variable for use in CSS
export const fontVariable = exo2Font.variable
