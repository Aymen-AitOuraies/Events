import { CalendarDays } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[0.16em] text-cyan-950">
      <span className="grid size-9 place-items-center rounded-lg bg-cyan-600 text-white shadow-lg shadow-cyan-600/20">
        <CalendarDays size={18} strokeWidth={2.2} />
      </span>
      {!compact && <span>ALC <strong className="text-cyan-600">EVENTS</strong></span>}
    </div>
  )
}
