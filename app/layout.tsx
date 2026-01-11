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
  openGraph: {
    title: 'find my sf',
    description: 'Discover events happening in San Francisco!',
    url: 'https://findmysf.com',
    siteName: 'find my sf',
    images: [
      {
        url: '/preview-image.png',
        width: 1200,
        height: 630,
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

