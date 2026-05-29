'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/Sidebar'

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
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenue, {user.name ?? user.email}.
          </p>
        </main>
      </div>
    </div>
  )
}
