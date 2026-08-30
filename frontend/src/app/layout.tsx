import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore: Allow side-effect CSS import without type declarations
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#1a1410',
}

export const metadata: Metadata = {
  title: 'Xavier AlumniConnect · Alumni Management System',
  description: 'Connect, Network, and Grow with Your Alumni Community',
  icons: {
    icon: [
      { url: '/xavier_favicon.png', type: 'image/png' },
      { url: '/xavier_favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/xavier_favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/xavier_favicon.png',
    apple: '/xavier_favicon.png',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-secondary-50">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}