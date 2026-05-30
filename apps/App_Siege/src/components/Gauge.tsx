'use client'

// Jauge radiale (anneau) pour une valeur unique dans une plage [min, max].
// SVG pur, sans dépendance — cohérent avec le reste de l'app.
export function Gauge({
  value,
  min = 0,
  max = 100,
  unit = '',
  color = '#0ea5e9',
  track = '#e2e8f0',
  size = 168,
  stroke = 16,
  caption,
}: {
  value: number | null
  min?: number
  max?: number
  unit?: string
  color?: string
  track?: string
  size?: number
  stroke?: number
  caption?: string
}) {
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const fraction =
    value == null || max === min
      ? 0
      : Math.min(1, Math.max(0, (value - min) / (max - min)))
  const dashOffset = circumference * (1 - fraction)

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${value ?? '—'}${unit}`}
      >
        {/* Piste de fond */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        {/* Arc de valeur */}
        {value != null && fraction > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
        )}
        {/* Valeur centrale (re-pivotée pour rester horizontale) */}
        <g transform={`rotate(90 ${cx} ${cy})`}>
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-900 font-bold"
            style={{ fontSize: size * 0.2 }}
          >
            {value == null ? '—' : value.toFixed(1)}
          </text>
          {value != null && unit && (
            <text
              x={cx}
              y={cy + size * 0.16}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-slate-400 font-medium"
              style={{ fontSize: size * 0.1 }}
            >
              {unit}
            </text>
          )}
        </g>
      </svg>
      {caption && (
        <p className="mt-1 text-xs text-slate-400">{caption}</p>
      )}
    </div>
  )
}
