import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthContext'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AR TOUR UVG - Beacons Manager',
  description: 'Sistema de gestión de sensores por niveles del CIT',
  icons: {
    icon: '/icon.png',
  },
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
          {children}
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
