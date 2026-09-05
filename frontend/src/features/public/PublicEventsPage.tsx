import { useEffect, useState } from 'react'
import { CalendarDays, LogIn, Search } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import type { EventItem } from '../../types/event'
import { PublicEventCard } from './PublicEventCard'

type PublicEventsPageProps = { onAdmin: () => void; onSelect: (event: EventItem) => void }

export function PublicEventsPage({ onAdmin, onSelect }: PublicEventsPageProps) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    async function load() {
      try { setEvents(await apiRequest<EventItem[]>('/events', null)) }
      catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load events') }
      finally { setLoading(false) }
    }
    void load()
  }, [])
  const visible = events.filter((event) => `${event.title} ${event.description ?? ''} ${event.location ?? ''}`.toLowerCase().includes(query.toLowerCase()))
  return <main className="min-h-screen bg-[linear-gradient(140deg,#ecfeff_0%,#f8fafc_48%,#ffffff_100%)]"><header className="mx-auto flex w-[min(1160px,calc(100%-32px))] items-center justify-between border-b border-cyan-100 py-5 sm:w-[min(1160px,calc(100%-64px))] sm:py-7"><div className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-[0.16em] text-cyan-950"><span className="grid size-9 place-items-center rounded-lg bg-cyan-600 text-white"><CalendarDays size={18} /></span>ALC <strong className="text-cyan-600">EVENTS</strong></div><button onClick={onAdmin} className="flex items-center gap-2 rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"><LogIn size={16} /> Admin login</button></header><section className="mx-auto w-[min(1160px,calc(100%-32px))] px-0 pb-10 pt-16 sm:w-[min(1160px,calc(100%-64px))] sm:pt-24"><p className="text-xs font-bold tracking-[0.2em] text-cyan-600">OPEN CALENDAR</p><h1 className="mt-3 max-w-2xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-cyan-950 sm:text-7xl">Find your next moment.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-500">Browse the gatherings, workshops, and conversations happening with the ALC community.</p><label className="relative mt-8 block max-w-xl"><Search size={17} className="absolute left-3.5 top-3.5 text-cyan-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" className="w-full rounded-xl border border-cyan-100 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" /></label></section><section className="mx-auto w-[min(1160px,calc(100%-32px))] pb-20 sm:w-[min(1160px,calc(100%-64px))]"><div className="mb-5 flex items-center gap-3"><h2 className="font-display text-xl font-semibold text-cyan-950">Upcoming events</h2><span className="text-xs text-slate-400">{visible.length} available</span></div>{loading && <p className="text-sm text-slate-500">Loading events...</p>}{error && <p className="text-sm text-rose-600">{error}</p>}{!loading && !error && visible.length === 0 && <div className="rounded-2xl border border-dashed border-cyan-200 bg-white/70 py-16 text-center text-sm text-slate-500">No events found.</div>}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((event, index) => <PublicEventCard key={event.id} event={event} index={index} onOpen={() => onSelect(event)} />)}</div></section></main>
}
