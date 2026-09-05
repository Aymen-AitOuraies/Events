import { useState } from 'react'
import { CalendarClock, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { EventItem } from '../../types/event'

type EventCardProps = { event: EventItem; onOpen: () => void; onEdit: () => void; onDelete: () => void }

const coverStyles = [
  'from-cyan-950 via-cyan-700 to-cyan-400',
  'from-slate-950 via-cyan-900 to-teal-400',
  'from-cyan-900 via-sky-700 to-cyan-200',
]

export function EventCard({ event, onOpen, onEdit, onDelete }: EventCardProps) {
  const [now] = useState(() => Date.now())
  const start = new Date(event.startDate)
  const isPast = start.getTime() < now
  const coverStyle = coverStyles[event.title.length % coverStyles.length]
  const initials = event.title.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  return (
    <article onClick={onOpen} className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10">
      <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-linear-to-br ${coverStyle}`}>
        <div className="absolute -right-8 -top-10 size-36 rounded-full border-18 border-white/10" />
        <div className="absolute -bottom-16 -left-8 size-40 rounded-full border-22 border-white/10" />
        <span className="relative font-display text-5xl font-semibold tracking-widest text-white/90">{initials}</span>
        <div className="absolute right-3 top-3 flex gap-1">
          <button title="Edit event" onClick={(clickEvent) => { clickEvent.stopPropagation(); onEdit() }} className="grid size-8 place-items-center rounded-md bg-white/90 text-cyan-950 shadow-sm transition hover:bg-white"><Pencil size={14} /></button>
          <button title="Delete event" onClick={(clickEvent) => { clickEvent.stopPropagation(); onDelete() }} className="grid size-8 place-items-center rounded-md bg-white/90 text-slate-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate font-display text-base font-semibold text-slate-800">{event.title}</h3>
        <p className="mt-1 truncate text-xs text-slate-500">{event.description || 'No description added yet.'}</p>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-2"><CalendarClock size={14} className="text-cyan-600" />{start.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} · {start.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span>
          {event.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-cyan-600" />{event.location}</span>}
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold">
          <span className={`flex items-center gap-1.5 ${isPast ? 'text-slate-400' : 'text-emerald-600'}`}><span className="size-1.5 rounded-full bg-current" />{isPast ? 'Past' : 'Upcoming'}</span>
          <span className="text-slate-400">Event</span>
        </div>
      </div>
    </article>
  )
}
