import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Avatar Lobby - Aisu Samba Dancing',
  description: '💃 Watch Aisu perform her signature Samba dance in an animated club environment with neon lights and music.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aisu Lobby'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e3a8a'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} select-none touch-manipulation`}>
        {children}
      </body>
    </html>
  )
}