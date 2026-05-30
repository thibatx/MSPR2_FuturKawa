'use client'

import { useEffect, useRef, useState } from 'react'
import { COUNTRIES, useCountry } from '@/lib/country-context'

const COUNTRY_NAME = new Map(COUNTRIES.map((c) => [c.index, c.name]))

// Styles des zones : le survol passe par du CSS :hover (réinitialisation fiable).
const ZONE_STYLES = `
  .fk-zone {
    cursor: pointer;
    transform-box: fill-box;
    transform-origin: center;
    transition: transform .2s ease, fill .2s ease;
  }
  .fk-zone:hover {
    fill: #6366f1 !important; /* brand-500 */
    transform: scale(1.08);
  }
  .fk-zone.fk-selected {
    fill: #4f46e5 !important; /* brand-600 */
  }
  .fk-zone.fk-selected:hover {
    fill: #4f46e5 !important;
    transform: scale(1.08);
  }
`

export function CountryMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selected, select } = useCountry()
  // Référence vers la dernière version de `select` pour ne pas relancer
  // le chargement du SVG à chaque rendu.
  const selectRef = useRef(select)
  const [svgReady, setSvgReady] = useState(false)

  useEffect(() => {
    selectRef.current = select
  }, [select])

  // Chargement et préparation du SVG (une seule fois).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false

    fetch('/map_country.svg')
      .then((res) => res.text())
      .then((markup) => {
        if (cancelled || !container) return

        container.innerHTML = markup

        const svg = container.querySelector('svg')
        if (svg) {
          // Responsive : la carte occupe la hauteur dispo, le ratio est préservé.
          svg.removeAttribute('width')
          svg.removeAttribute('height')
          svg.style.height = '90%'
          svg.style.width = 'auto'
          svg.style.maxWidth = '100%'
          svg.style.maxHeight = '90%'
          svg.style.overflow = 'visible'

          const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
          style.textContent = ZONE_STYLES
          svg.insertBefore(style, svg.firstChild)
        }

        const paths = container.querySelectorAll('path')
        paths.forEach((path, i) => {
          const index = i + 1
          path.setAttribute('id', `country-${index}`)

          const name = COUNTRY_NAME.get(index)

          if (!name) {
            // Zones non interactives : aucun survol, aucun clic.
            path.style.pointerEvents = 'none'
            return
          }

          path.classList.add('fk-zone')
          // Le clic sur la carte met à jour la sélection partagée (→ sidebar).
          path.addEventListener('click', () => selectRef.current(index))
        })

        // Une seule fois : on place les pays interactifs au premier plan
        // (dessinés en dernier) pour que l'agrandissement au survol ne soit
        // jamais masqué par les pays voisins.
        COUNTRIES.forEach(({ index }) => {
          const path = container.querySelector<SVGPathElement>(`#country-${index}`)
          path?.parentElement?.appendChild(path)
        })

        setSvgReady(true)
      })
      .catch((err) => console.error('Erreur de chargement de la carte :', err))

    return () => {
      cancelled = true
    }
  }, [])

  // Surbrillance du pays sélectionné — réagit aussi bien à un clic sur la
  // carte qu'à une sélection faite depuis le dropdown de la sidebar.
  useEffect(() => {
    const container = containerRef.current
    if (!container || !svgReady) return

    container
      .querySelectorAll('.fk-selected')
      .forEach((el) => el.classList.remove('fk-selected'))

    if (selected) {
      const target = container.querySelector<SVGPathElement>(`#country-${selected.index}`)
      if (target) {
        target.classList.add('fk-selected')
        target.parentElement?.appendChild(target) // au premier plan
      }
    }
  }, [selected, svgReady])

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center overflow-hidden"
      />
    </div>
  )
}
