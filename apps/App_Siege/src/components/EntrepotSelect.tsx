'use client'

import { useEffect, useRef, useState } from 'react'
import type { Entrepot } from '@/lib/api'

// Dropdown des entrepôts de l'exploitation sélectionnée (vert).
// Présentational : l'état (liste + sélection) est piloté par la page Entrepôts.
export function EntrepotSelect({
  items,
  selectedId,
  onSelect,
  placeholder = 'Sélectionner un entrepôt',
  disabled = false,
}: {
  items: Entrepot[]
  selectedId: number | null
  onSelect: (id: number) => void
  placeholder?: string
  disabled?: boolean
}) {
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

  const selected = items.find((e) => e.id === selectedId) ?? null
  const isDisabled = disabled || items.length === 0
  const label = (e: Entrepot) => e.nom ?? `Entrepôt #${e.id}`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#d8c4b6] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#b08968] hover:bg-[#f5efe9] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[#d8c4b6] disabled:hover:bg-white"
      >
        <span className="flex items-center gap-2 truncate">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              selected ? 'bg-[#6f4e37]' : 'bg-slate-300'
            }`}
          />
          <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
            {selected ? label(selected) : placeholder}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-[#8b5e34] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && items.length > 0 && (
        <ul className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[#d8c4b6] bg-white py-1 shadow-lg">
          {items.map((entrepot) => {
            const isActive = selectedId === entrepot.id
            return (
              <li key={entrepot.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(entrepot.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition ${
                    isActive
                      ? 'bg-[#f5efe9] font-semibold text-[#6f4e37]'
                      : 'text-slate-600 hover:bg-[#f5efe9] hover:text-[#5a3e2b]'
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive ? 'bg-[#6f4e37]' : 'bg-slate-300'
                    }`}
                  />
                  {label(entrepot)}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
