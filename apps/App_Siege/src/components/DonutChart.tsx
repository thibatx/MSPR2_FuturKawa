'use client'

export type DonutSegment = {
  label: string
  value: number
  color: string
}

// Donut segmenté avec total au centre et légende à droite.
// SVG pur — reproduit le visuel « répartition » fourni en exemple.
export function DonutChart({
  segments,
  size = 168,
  stroke = 22,
  centerLabel,
}: {
  segments: DonutSegment[]
  size?: number
  stroke?: number
  centerLabel?: string
}) {
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const total = segments.reduce((acc, s) => acc + s.value, 0)

  // Construit les arcs : chaque segment occupe une fraction de la circonférence.
  let offset = 0
  const arcs = segments.map((s) => {
    const fraction = total === 0 ? 0 : s.value / total
    const len = fraction * circumference
    const arc = {
      ...s,
      dasharray: `${len} ${circumference - len}`,
      dashoffset: -offset,
    }
    offset += len
    return arc
  })

  return (
    <div className="flex items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 shrink-0"
        role="img"
        aria-label="Répartition"
      >
        {/* Piste de fond (visible si total = 0) */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.dashoffset}
          />
        ))}
        {/* Total au centre */}
        <g transform={`rotate(90 ${cx} ${cy})`}>
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-900 font-bold"
            style={{ fontSize: size * 0.22 }}
          >
            {total}
          </text>
          {centerLabel && (
            <text
              x={cx}
              y={cy + size * 0.17}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-slate-400 font-medium"
              style={{ fontSize: size * 0.09 }}
            >
              {centerLabel}
            </text>
          )}
        </g>
      </svg>

      {/* Légende */}
      <ul className="space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-slate-600">{s.label}</span>
            <span className="font-semibold text-slate-900">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
