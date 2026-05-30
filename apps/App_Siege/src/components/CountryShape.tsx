'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import exploitationIcon from '@/assets/exploitation.png'
import { useCountry } from '@/lib/country-context'
import { useExploitations } from '@/lib/exploitation-context'

type Marker = { id: number; nom: string; left: number; top: number }

// Fraction déterministe dans [0, 1) à partir d'une graine.
function fraction(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Cherche un point déterministe situé À L'INTÉRIEUR du tracé, en coordonnées
// utilisateur du SVG (espace de la bounding box). Dépend uniquement de l'id :
// la position reste donc fixe (l'utilisateur garde ses repères) et tombe
// toujours sur la zone du pays. Repli sur le centre de la bbox si besoin.
function interiorPoint(path: SVGPathElement, bbox: DOMRect, id: number) {
  for (let k = 0; k < 120; k++) {
    const x = bbox.x + fraction((id + 1) * 12.9898 + k * 3.17) * bbox.width
    const y = bbox.y + fraction((id + 1) * 78.233 + k * 6.91) * bbox.height
    if (path.isPointInFill(new DOMPoint(x, y))) return { x, y }
  }
  return { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 }
}

// Affiche le tracé du pays sélectionné, centré et agrandi (viewBox ajusté à sa
// bounding box), avec les marqueurs d'exploitations posés SUR la zone.
export function CountryShape() {
  const { selected: country } = useCountry()
  const { items, selected, select } = useExploitations()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgHostRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const itemsRef = useRef(items)
  const [markers, setMarkers] = useState<Marker[]>([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // (Re)calcule la position pixel des marqueurs à partir de la géométrie du
  // tracé. Stable : ne dépend que des id et de la taille rendue du conteneur.
  const computeMarkers = useCallback(() => {
    const container = containerRef.current
    const path = pathRef.current
    if (!container || !path) return
    const ctm = path.getScreenCTM()
    if (!ctm) return
    const bbox = path.getBBox()
    const rect = container.getBoundingClientRect()
    setMarkers(
      itemsRef.current.map((e) => {
        const { x, y } = interiorPoint(path, bbox, e.id)
        const sp = new DOMPoint(x, y).matrixTransform(ctm)
        return { id: e.id, nom: e.nom, left: sp.x - rect.left, top: sp.y - rect.top }
      }),
    )
  }, [])

  // Construit le SVG du pays sélectionné (rendu impératif, isolé dans svgHost
  // pour ne pas entrer en conflit avec l'overlay React des marqueurs).
  useEffect(() => {
    const host = svgHostRef.current
    if (!host || !country) return

    let cancelled = false

    fetch('/map_country.svg')
      .then((res) => res.text())
      .then((markup) => {
        if (cancelled || !host) return

        const doc = new DOMParser().parseFromString(markup, 'image/svg+xml')
        const paths = doc.querySelectorAll('path')
        const target = paths[country.index - 1] // index 1-based → position du <path>
        if (!target) {
          host.innerHTML = ''
          svgRef.current = null
          pathRef.current = null
          setMarkers([])
          return
        }

        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.setAttribute('xmlns', svgNS)
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.overflow = 'visible'

        const path = target.cloneNode(true) as SVGPathElement
        path.removeAttribute('style')
        path.removeAttribute('class')
        svg.appendChild(path)

        host.innerHTML = ''
        host.appendChild(svg)

        // Dimensions réelles du tracé → on dimensionne les effets proportionnellement.
        const bbox = path.getBBox()
        const maxDim = Math.max(bbox.width, bbox.height)

        // Dégradé de marque + ombre portée douce, calés sur la taille du pays.
        const defs = document.createElementNS(svgNS, 'defs')
        defs.innerHTML = `
          <linearGradient id="fk-shape-grad" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stop-color="#a5b4fc" />
            <stop offset="55%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#4338ca" />
          </linearGradient>
          <filter id="fk-shape-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="${maxDim * 0.02}" stdDeviation="${maxDim * 0.025}"
              flood-color="#4338ca" flood-opacity="0.45" />
          </filter>
        `
        svg.insertBefore(defs, svg.firstChild)

        path.setAttribute('fill', 'url(#fk-shape-grad)')
        path.setAttribute('stroke', '#eef2ff')
        path.setAttribute('stroke-width', `${maxDim * 0.006}`)
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('filter', 'url(#fk-shape-shadow)')

        // viewBox calé sur la bounding box (avec marge pour l'ombre) → centré.
        const pad = maxDim * 0.14
        svg.setAttribute(
          'viewBox',
          `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`,
        )

        svgRef.current = svg
        pathRef.current = path
        computeMarkers()
      })
      .catch((err) => console.error('Erreur de chargement de la carte :', err))

    return () => {
      cancelled = true
    }
  }, [country, computeMarkers])

  // Recalcule quand la liste change ou que le conteneur est redimensionné.
  useEffect(() => {
    computeMarkers()
  }, [items, computeMarkers])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => computeMarkers())
    ro.observe(container)
    return () => ro.disconnect()
  }, [computeMarkers])

  if (!country) {
    return <p className="text-sm text-slate-400">Sélectionnez un pays pour afficher sa carte.</p>
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <div ref={svgHostRef} className="flex h-full w-full items-center justify-center" />

      {/* Marqueurs d'exploitations posés sur le tracé : icône + nom en dessous. */}
      <div className="pointer-events-none absolute inset-0">
        {markers.map((m) => {
          const isActive = selected?.id === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => select(isActive ? null : m.id)}
              style={{ left: m.left, top: m.top }}
              className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition hover:scale-105 focus:outline-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exploitationIcon.src}
                alt=""
                className={`h-11 w-11 object-contain transition ${isActive ? 'scale-110' : ''}`}
              />
              <span
                className={`max-w-[8rem] truncate rounded-md px-2 py-0.5 text-xs font-semibold shadow-sm ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-white/90 text-emerald-700'
                }`}
              >
                {m.nom}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
