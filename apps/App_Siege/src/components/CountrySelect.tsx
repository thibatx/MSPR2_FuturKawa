'use client'

import { useEffect, useRef, useState } from 'react'
import { COUNTRIES, useCountry } from '@/lib/country-context'

// Dropdown de sélection du pays, synchronisé avec la carte du Dashboard
// via le CountryContext (sélection partagée dans les deux sens).
export function CountrySelect() {
  const { selected, select } = useCountry()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Ferme le menu au clic en dehors.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              selected ? 'bg-brand-600' : 'bg-slate-300'
            }`}
          />
          <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
            {selected ? selected.name : 'Sélectionner un pays'}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/5">
          {COUNTRIES.map((country) => {
            const isActive = selected?.index === country.index
            return (
              <li key={country.index}>
                <button
                  type="button"
                  onClick={() => {
                    select(country.index)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition ${
                    isActive
                      ? 'bg-brand-50 font-semibold text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                  />
                  {country.name}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
