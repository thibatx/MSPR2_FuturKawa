'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@app/types'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Sidebar } from '@/components/Sidebar'

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  // Formulaire de création
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [actionId, setActionId] = useState<string | null>(null)

  // Suppression d'un utilisateur (avec modale de confirmation)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Garde d'accès : connecté + admin uniquement
  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if (user.role !== 'ADMIN') router.replace('/dashboard')
  }, [user, loading, router])

  const loadUsers = useCallback(() => {
    setListLoading(true)
    setListError(null)
    api
      .listUsers()
      .then(setUsers)
      .catch((e) =>
        setListError(e instanceof Error ? e.message : 'Erreur de chargement'),
      )
      .finally(() => setListLoading(false))
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') loadUsers()
  }, [user, loadUsers])

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await api.createUser({
        email,
        password,
        name: name || undefined,
        role,
      })
      setEmail('')
      setName('')
      setPassword('')
      setRole('USER')
      loadUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Échec de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const changeRole = async (target: User, newRole: 'USER' | 'ADMIN') => {
    setActionId(target.id)
    try {
      await api.setUserRole(target.id, newRole)
      loadUsers()
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : 'Échec du changement de rôle',
      )
    } finally {
      setActionId(null)
    }
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    setListError(null)
    try {
      await api.deleteUser(userToDelete.id)
      setUserToDelete(null)
      loadUsers()
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : 'Échec de la suppression',
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !user || user.role !== 'ADMIN') {
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
        <main className="flex-1 space-y-6 p-6">
          {/* Création d'un utilisateur */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Créer un utilisateur
            </h2>
            <form
              onSubmit={onCreate}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="user@futurkawa.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Optionnel"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-16 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="8 caractères min."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-brand-600 hover:text-brand-700"
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              {formError && (
                <p className="md:col-span-2 lg:col-span-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {submitting ? 'Création…' : 'Créer l’utilisateur'}
                </button>
              </div>
            </form>
          </div>

          {/* Liste des utilisateurs */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Liste des utilisateurs
              </h2>
              <button
                onClick={loadUsers}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Rafraîchir
              </button>
            </div>

            {listError && (
              <p className="m-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {listError}
              </p>
            )}

            {listLoading ? (
              <p className="p-6 text-sm text-slate-400">Chargement…</p>
            ) : users.length === 0 ? (
              <p className="p-6 text-sm text-slate-400">Aucun utilisateur.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-3 font-medium">Nom</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Rôle</th>
                      <th className="px-6 py-3 font-medium">Créé le</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSelf = u.id === user.id
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="px-6 py-3 font-medium text-slate-900">
                            {u.name ?? '—'}
                          </td>
                          <td className="px-6 py-3 text-slate-600">{u.email}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                u.role === 'ADMIN'
                                  ? 'bg-brand-100 text-brand-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.role === 'ADMIN'
                                ? 'Administrateur'
                                : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {u.role === 'USER' ? (
                                <button
                                  onClick={() => changeRole(u, 'ADMIN')}
                                  disabled={actionId === u.id}
                                  className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
                                >
                                  {actionId === u.id ? '…' : 'Passer admin'}
                                </button>
                              ) : isSelf ? (
                                <span className="text-xs text-slate-400">
                                  Vous
                                </span>
                              ) : (
                                <button
                                  onClick={() => changeRole(u, 'USER')}
                                  disabled={actionId === u.id}
                                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                                >
                                  {actionId === u.id ? '…' : 'Rétrograder'}
                                </button>
                              )}
                              {!isSelf && (
                                <button
                                  onClick={() => setUserToDelete(u)}
                                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modale de confirmation de suppression */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => !deleting && setUserToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Supprimer l’utilisateur
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Voulez-vous vraiment supprimer{' '}
              <span className="font-medium text-slate-900">
                {userToDelete.name ?? userToDelete.email}
              </span>{' '}
              ? Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
