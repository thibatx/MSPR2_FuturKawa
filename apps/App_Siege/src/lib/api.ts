import type {
  AuthResponse,
  CreateUserPayload,
  LoginPayload,
  RegisterPayload,
  Role,
  User,
} from '@app/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
const TOKEN_KEY = 'app_token'

// Entrepôt rattaché à une exploitation.
export type Entrepot = {
  id: number
  nom: string | null
}

// Exploitation agrégée depuis l'API d'un pays (via API_Siege).
export type Exploitation = {
  id: number
  nom: string
  entrepots?: Entrepot[]
}

// Lot stocké dans un entrepôt. Les BIGINT sont sérialisés en nombres et les
// dates en chaîne ISO côté API pays.
export type Lot = {
  id: number
  idEntrepot: number | null
  dateStockage: string
  statut: string | null
}

// Relevé capteur d'un entrepôt (température / humidité).
export type Mesure = {
  id: number
  idEntrepot: number | null
  temperature: number | null
  humidite: number | null
  statut: string | null
  timestamp: string
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    try {
      const body = await res.json()
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export const api = {
  login: (payload: LoginPayload) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<User>('/auth/me'),

  // --- Administration (réservé aux admins) ---
  listUsers: () => request<User[]>('/users'),
  createUser: (payload: CreateUserPayload) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  setUserRole: (id: string, role: Role) =>
    request<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // --- Données pays (agrégées par l'API_Siège) ---
  // country = clé de routage côté Siège : 'colombia' | 'brazil'.
  listExploitations: (country: string) =>
    request<Exploitation[]>(`/countries/${country}/exploitations`),

  // Lots et mesures, filtrés par entrepôt (idEntrepot).
  listLots: (country: string, entrepotId: number) =>
    request<Lot[]>(`/countries/${country}/lots?entrepotId=${entrepotId}`),
  listMesures: (country: string, entrepotId: number) =>
    request<Mesure[]>(`/countries/${country}/mesures?entrepotId=${entrepotId}`),

  // CRUD exploitations — réservé aux admins (vérifié côté API_Siège).
  createExploitation: (country: string, nom: string) =>
    request<Exploitation>(`/countries/${country}/exploitations`, {
      method: 'POST',
      body: JSON.stringify({ nom }),
    }),
  updateExploitation: (country: string, id: number, nom: string) =>
    request<Exploitation>(`/countries/${country}/exploitations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nom }),
    }),
  deleteExploitation: (country: string, id: number) =>
    request<{ success: boolean }>(
      `/countries/${country}/exploitations/${id}`,
      { method: 'DELETE' },
    ),
}
