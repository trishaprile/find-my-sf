import './globals.css'
import './categories.css'
import { Metadata } from 'next'
import { DynaPuff, Gaegu } from 'next/font/google'
import { ReactNode } from 'react'

const dynaPuff = DynaPuff({ 
  subsets: ['latin'],
  variable: '--font-dynapuff',
})

const gaegu = Gaegu({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-gaegu',
})

export const metadata: Metadata = {
  title: 'find my sf',
  description: 'Discover events happening in San Francisco!',
  metadataBase: new URL('https://find-my-sf.vercel.app'),
  openGraph: {
    title: 'find my sf',
    description: 'Discover events happening in San Francisco!',
    url: 'https://find-my-sf.vercel.app',
    siteName: 'find my sf',
    images: [
      {
        url: '/preview-image.png',
        width: 1200,
        height: 630,
        alt: 'find my sf - Discover events happening in San Francisco!',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={`${dynaPuff.variable} ${gaegu.variable}`}>
      <body>{children}</body>
    </html>
  )
}

