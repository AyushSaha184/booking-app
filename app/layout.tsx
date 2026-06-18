import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resort Booking',
  description: 'Book your stay at our resort',
  // Prevent iOS from auto-linking phone numbers / dates in chat messages
  other: { 'format-detection': 'telephone=no, date=no' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,      // prevent iOS double-tap zoom
  userScalable: false,
  themeColor: '#0f0f0f',
  viewportFit: 'cover', // needed for safe-area-inset on notched phones
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
