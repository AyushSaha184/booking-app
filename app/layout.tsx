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
      <body className="bg-background text-text-primary antialiased min-h-screen flex flex-col">
        <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>
      </body>
    </html>
  )
}