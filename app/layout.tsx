import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resort Booking — Luxury Stays, Seamlessly Booked',
  description: 'Book your perfect stay at our resort with AI-powered assistance. Check availability, reserve rooms, and manage bookings effortlessly.',
  other: {
    // Prevent iOS from auto-linking phone numbers / dates in chat messages
    'format-detection': 'telephone=no, date=no',
  },
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
