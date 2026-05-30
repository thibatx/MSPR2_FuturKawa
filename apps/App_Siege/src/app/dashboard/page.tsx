'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/Sidebar'
import { CountryMap } from '@/components/CountryMap'
import { CountrySelect } from '@/components/CountrySelect'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Chargement…
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="relative flex flex-1 flex-col overflow-hidden p-6">
          {/* Dropdown pays en haut à droite, synchronisé avec la page Exploitations */}
          <div className="absolute right-6 top-6 z-20 w-52">
            <CountrySelect />
          </div>
          <div className="min-h-0 flex-1">
            <CountryMap />
          </div>
        </main>
      </div>
    </div>
  )
}
