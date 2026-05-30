'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

// `key` correspond à l'identifiant attendu par l'API_Siege pour router vers
// la bonne API pays (/countries/:key/...). Absent si le pays n'a pas d'API.
export type CountryKey = 'colombia' | 'brazil'
export type Country = { index: number; name: string; key?: CountryKey }

// Zones interactives : index du <path> dans le SVG → nom du pays.
// Source unique partagée entre la carte (Dashboard) et le dropdown (Sidebar).
export const COUNTRIES: Country[] = [
  { index: 4, name: 'Brésil', key: 'brazil' },
  { index: 5, name: 'Colombie', key: 'colombia' },
  { index: 6, name: 'Équateur' },
]

const COUNTRY_BY_INDEX = new Map(COUNTRIES.map((c) => [c.index, c]))

type CountryContextValue = {
  selected: Country | null
  select: (index: number) => void
  clear: () => void
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined)

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Country | null>(null)

  const select = (index: number) => {
    const country = COUNTRY_BY_INDEX.get(index)
    if (!country) return
    setSelected(country)
  }

  const clear = () => setSelected(null)

  return (
    <CountryContext.Provider value={{ selected, select, clear }}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const ctx = useContext(CountryContext)
  if (!ctx) throw new Error('useCountry doit être utilisé dans CountryProvider')
  return ctx
}
