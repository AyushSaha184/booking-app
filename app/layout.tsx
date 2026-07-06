import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dorshi Holiday Resort cum Restaurant — Luxury Stays',
  description: 'Book your perfect stay at Dorshi Holiday Resort cum Restaurant. Check availability, reserve rooms, and manage your booking effortlessly.',
  other: {
    'format-detection': 'telephone=no, date=no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAFAF8',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}