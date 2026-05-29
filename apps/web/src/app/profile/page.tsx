'use client'

import { useEffect, useRef, useState } from 'react'
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

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  // Menu de profil dans la sidebar
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Fermer le menu profil au clic en dehors
  useEffect(() => {
    if (!profileOpen) return
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [profileOpen])

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
        <div className="relative mb-8" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </div>
            <span className="truncate font-semibold text-slate-900">
              {user.name ?? user.email}
            </span>
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="block border-b border-slate-100 px-3 py-2 transition hover:bg-slate-50"
              >
                <p className="truncate text-sm font-medium text-slate-900">
                  {user.name ?? '—'}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </Link>
              <button
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false)
                  logout()
                  router.replace('/login')
                }}
                className="block w-full px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Tableau de bord
          </Link>
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
