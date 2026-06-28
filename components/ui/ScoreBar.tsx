function scoreColor(v: number) {
  if (v >= 70) return '#10b981'
  if (v >= 45) return '#f59e0b'
  return '#ef4444'
}

interface ScoreBarProps {
  label: string
  value: number
}

export function ScoreBar({ label, value }: ScoreBarProps) {
  const color = scoreColor(value)
  const pct = Math.min(100, Math.round(value))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-surface-300">{label}</span>
        <span className="font-mono font-semibold tabular-nums" style={{ color }}>
          {Math.round(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-700">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
