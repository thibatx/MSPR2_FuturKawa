'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/Sidebar'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

export default function ProfilePage() {
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

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {user.name ?? user.email}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    user.role === 'ADMIN'
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Informations du compte
            </h3>
            <InfoRow label="Nom" value={user.name ?? '—'} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Rôle" value={user.role} />
            <InfoRow
              label="Membre depuis"
              value={new Date(user.createdAt).toLocaleDateString('fr-FR')}
            />
            <InfoRow label="Identifiant" value={user.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
