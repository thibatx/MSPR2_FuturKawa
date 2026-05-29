'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
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
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            F
          </div>
          <span className="font-semibold text-slate-900">FuturKawa</span>
        </div>
        <nav className="space-y-1">
          <span className="flex items-center rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
            Tableau de bord
          </span>
          {user.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Utilisateurs
            </Link>
          )}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">
            Tableau de bord
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <button
              onClick={() => {
                logout()
                router.replace('/login')
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Bonjour {user.name ?? user.email} 👋
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Voici les informations de votre compte.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Mon compte
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

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Statut
              </h3>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
              </span>
              <p className="mt-4 text-sm text-slate-500">
                Vous êtes connecté de manière sécurisée via un token JWT.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
