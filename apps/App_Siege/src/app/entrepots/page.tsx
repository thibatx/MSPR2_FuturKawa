'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useCountry } from '@/lib/country-context'
import { useExploitations } from '@/lib/exploitation-context'
import { api, type Lot, type Mesure } from '@/lib/api'
import { Sidebar } from '@/components/Sidebar'
import { ExploitationSelect } from '@/components/ExploitationSelect'
import { EntrepotSelect } from '@/components/EntrepotSelect'
import { Gauge } from '@/components/Gauge'
import { DonutChart, type DonutSegment } from '@/components/DonutChart'

// Palette pour les segments du donut « lots par statut ».
const STATUT_PALETTE = [
  '#2563eb',
  '#93c5fd',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#64748b',
]

// Moyenne des valeurs non nulles d'une série, ou null si vide.
function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null)
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const fmt = (v: number | null, suffix = '') =>
  v == null ? '—' : `${v.toFixed(1)}${suffix}`

export default function EntrepotsPage() {
  const { user, loading } = useAuth()
  const { selected: country } = useCountry()
  const { selected: exploitation } = useExploitations()
  const router = useRouter()

  const entrepots = useMemo(() => exploitation?.entrepots ?? [], [exploitation])

  const [entrepotId, setEntrepotId] = useState<number | null>(null)
  const [lots, setLots] = useState<Lot[]>([])
  const [mesures, setMesures] = useState<Mesure[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  // Sélectionne le premier entrepôt par défaut quand l'exploitation change.
  useEffect(() => {
    setEntrepotId(entrepots[0]?.id ?? null)
  }, [entrepots])

  // Charge lots + mesures de l'entrepôt sélectionné.
  useEffect(() => {
    if (!country?.key || entrepotId == null) {
      setLots([])
      setMesures([])
      return
    }

    const key = country.key
    let cancelled = false
    setDataLoading(true)
    setDataError(null)
    Promise.all([
      api.listLots(key, entrepotId),
      api.listMesures(key, entrepotId),
    ])
      .then(([lotsData, mesuresData]) => {
        if (cancelled) return
        setLots(lotsData)
        setMesures(mesuresData)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setDataError(e instanceof Error ? e.message : 'Erreur de chargement')
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [country?.key, entrepotId])

  // Métriques dérivées (les mesures sont renvoyées triées du plus récent au plus ancien).
  const metrics = useMemo(() => {
    const latest = mesures[0] ?? null
    const temps = mesures.map((m) => m.temperature)
    const hums = mesures.map((m) => m.humidite)

    const lotsByStatut = lots.reduce<Record<string, number>>((acc, lot) => {
      const k = lot.statut ?? 'Inconnu'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {})

    return {
      nbLots: lots.length,
      nbMesures: mesures.length,
      currentTemp: latest?.temperature ?? null,
      currentHum: latest?.humidite ?? null,
      avgTemp: average(temps),
      avgHum: average(hums),
      lotsByStatut,
    }
  }, [lots, mesures])

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

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="relative flex flex-1 flex-col overflow-y-auto p-6">
          {/* En-tête : titre à gauche, dropdowns exploitation + entrepôt à droite */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Entrepôts
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {exploitation
                  ? `Exploitation : ${exploitation.nom}`
                  : 'Aucune exploitation sélectionnée'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="w-56">
                <ExploitationSelect />
              </div>
              <div className="w-56">
                <EntrepotSelect
                  items={entrepots}
                  selectedId={entrepotId}
                  onSelect={setEntrepotId}
                  disabled={!exploitation}
                  placeholder={
                    !exploitation
                      ? 'Choisir une exploitation'
                      : entrepots.length === 0
                        ? 'Aucun entrepôt'
                        : 'Sélectionner un entrepôt'
                  }
                />
              </div>
            </div>
          </div>

          {/* États : pas d'exploitation / pas d'entrepôt / chargement / erreur */}
          {!exploitation ? (
            <EmptyState
              title="Sélectionnez une exploitation"
              text="Rendez-vous sur la page Exploitations pour choisir une exploitation, puis revenez ici pour explorer ses entrepôts."
            />
          ) : entrepots.length === 0 ? (
            <EmptyState
              title="Aucun entrepôt"
              text="Cette exploitation ne possède aucun entrepôt."
            />
          ) : dataError ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {dataError}
            </p>
          ) : (
            <>
              {/* Cartes de métriques (chiffres clés) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Nombre de lots"
                  value={dataLoading ? '…' : String(metrics.nbLots)}
                  accent="brand"
                />
              </div>

              {/* Graphiques : jauges température/humidité + donut lots par statut */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Conditions de l'entrepôt : jauges radiales */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Conditions de l’entrepôt
                  </h2>
                  {dataLoading ? (
                    <p className="py-10 text-center text-sm text-slate-400">
                      Chargement…
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center justify-around gap-6">
                      <div className="flex flex-col items-center">
                        <Gauge
                          value={metrics.currentTemp}
                          min={0}
                          max={50}
                          unit="°C"
                          color="#f59e0b"
                          caption={`Moyenne : ${fmt(metrics.avgTemp, ' °C')}`}
                        />
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          Température
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <Gauge
                          value={metrics.currentHum}
                          min={0}
                          max={100}
                          unit="%"
                          color="#0ea5e9"
                          caption={`Moyenne : ${fmt(metrics.avgHum, ' %')}`}
                        />
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          Humidité
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-16 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-md text-sm text-slate-400">{text}</p>
    </div>
  )
}

const accentMap: Record<string, string> = {
  brand: 'text-brand-600',
  amber: 'text-amber-600',
  sky: 'text-sky-600',
  emerald: 'text-emerald-600',
  slate: 'text-slate-700',
}

function MetricCard({
  label,
  value,
  sub,
  accent = 'slate',
  span2 = false,
}: {
  label: string
  value: ReactNode
  sub?: string
  accent?: keyof typeof accentMap | string
  span2?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${
        span2 ? 'sm:col-span-2' : ''
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accentMap[accent] ?? accentMap.slate}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}
