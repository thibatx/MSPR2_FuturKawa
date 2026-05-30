import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { CountryProvider } from '@/lib/country-context'
import { ExploitationProvider } from '@/lib/exploitation-context'

export const metadata: Metadata = {
  title: 'App Template',
  description: 'Monorepo template — NestJS + Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <CountryProvider>
            <ExploitationProvider>{children}</ExploitationProvider>
          </CountryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
