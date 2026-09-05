import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Grid2X2, List, Plus, Search, SlidersHorizontal, UserCircle2, X } from 'lucide-react'
import { Sidebar } from '../../components/Sidebar'
import { apiRequest } from '../../lib/api'
import { emptyEventForm, type EventForm, type EventItem } from '../../types/event'
import { EventCard } from './EventCard'
import { EventFormModal } from './EventFormModal'
import { EventFieldsPage } from './EventFieldsPage'

type EventsDashboardProps = { token: string; onSignout: () => void }
type Filter = 'all' | 'upcoming' | 'past'

function toInputDate(value: string) {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function EventsDashboard({ token, onSignout }: EventsDashboardProps) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [form, setForm] = useState<EventForm>(emptyEventForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [now] = useState(() => Date.now())

  async function loadEvents() {
    setLoading(true)
    setError('')
    try { setEvents(await apiRequest<EventItem[]>('/events', token)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load events') }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadEvents() }, [token])

  function openCreate() { setEditingId(null); setForm(emptyEventForm); setError(''); setShowForm(true) }
  function openEdit(event: EventItem) {
    setEditingId(event.id)
    setForm({ title: event.title, description: event.description ?? '', location: event.location ?? '', startDate: toInputDate(event.startDate), endDate: toInputDate(event.endDate) })
    setShowForm(true)
  }
  async function saveEvent(submitEvent: FormEvent) {
    submitEvent.preventDefault(); setLoading(true); setError('')
    try {
      const saved = await apiRequest<EventItem>(editingId ? `/events/${editingId}` : '/events', token, { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(form) })
      setEvents((current) => editingId ? current.map((item) => item.id === editingId ? saved : item) : [saved, ...current])
      setShowForm(false)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save event') }
    finally { setLoading(false) }
  }
  async function deleteEvent(id: string) {
    if (!window.confirm('Delete this event?')) return
    try { await apiRequest(`/events/${id}`, token, { method: 'DELETE' }); setEvents((current) => current.filter((item) => item.id !== id)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete event') }
  }

  const visibleEvents = events.filter((event) => {
    const matchesQuery = `${event.title} ${event.description ?? ''} ${event.location ?? ''}`.toLowerCase().includes(query.toLowerCase())
    const isUpcoming = new Date(event.startDate).getTime() >= now
    return matchesQuery && (filter === 'all' || (filter === 'upcoming' && isUpcoming) || (filter === 'past' && !isUpcoming))
  })

  if (selectedEvent) return <EventFieldsPage event={selectedEvent} token={token} onBack={() => setSelectedEvent(null)} onSignout={onSignout} />

  return (
    <main className="flex min-h-screen bg-[#eef2ff] text-slate-700">
      <Sidebar onSignout={onSignout} />
      <div className="min-w-0 flex-1 bg-white md:m-4 md:ml-0 md:rounded-2xl md:shadow-xl md:shadow-cyan-950/10">
        <header className="flex h-16 items-center justify-between border-b border-slate-100 px-5 sm:px-7">
          <div className="flex items-center gap-3"><div className="grid size-8 place-items-center rounded-lg bg-cyan-50 text-cyan-600 md:hidden"><CalendarDays size={17} /></div><h1 className="font-display text-base font-semibold text-slate-800">My events</h1></div>
          <div className="flex items-center gap-4"><span className="hidden text-xs text-slate-400 sm:inline">Welcome back</span><button title="Account" className="text-cyan-700"><UserCircle2 size={23} /></button></div>
        </header>
        <section className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Events workspace</p><h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">Plan what is next.</h2></div><button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-700"><Plus size={17} /> Add event</button></div>
          <div className="mt-5 flex flex-col gap-2 xl:flex-row"><label className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10" placeholder="Search by keywords" />{query && <button title="Clear search" onClick={() => setQuery('')} className="absolute right-2 top-2.5 text-slate-400"><X size={16} /></button>}</label><div className="flex gap-2"><select value={filter} onChange={(event) => setFilter(event.target.value as Filter)} className="min-w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-400"><option value="all">Status: All</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select><button onClick={() => setFilter('all')} className="hidden items-center gap-1 px-2 text-xs text-slate-400 hover:text-cyan-600 sm:flex"><SlidersHorizontal size={14} /> Reset</button><div className="hidden rounded-md border border-slate-200 p-0.5 sm:flex"><button title="List view" onClick={() => setView('list')} className={`grid size-8 place-items-center rounded ${view === 'list' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-400'}`}><List size={16} /></button><button title="Grid view" onClick={() => setView('grid')} className={`grid size-8 place-items-center rounded ${view === 'grid' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-400'}`}><Grid2X2 size={16} /></button></div></div></div>
        </section>
        <section className="p-5 sm:p-7">{error && !showForm && <p className="mb-4 text-sm text-rose-600">{error}</p>}{loading && <p className="text-sm text-slate-500">Loading your events...</p>}{!loading && events.length > 0 && visibleEvents.length === 0 && <div className="py-16 text-center text-sm text-slate-500">No events match these filters.</div>}{!loading && events.length === 0 && <div className="rounded-xl border border-dashed border-cyan-200 bg-cyan-50/30 px-5 py-16 text-center"><CalendarDays className="mx-auto text-cyan-500" size={32} /><h3 className="mt-4 font-display text-lg font-semibold text-cyan-950">A blank calendar, for now.</h3><p className="mt-1 text-sm text-slate-500">Create your first event and give the calendar a pulse.</p><button onClick={openCreate} className="mt-5 inline-flex items-center gap-1.5 font-semibold text-cyan-700">Create an event <Plus size={16} /></button></div>}<div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-3'}>{visibleEvents.map((event) => <EventCard key={event.id} event={event} onOpen={() => setSelectedEvent(event)} onEdit={() => void openEdit(event)} onDelete={() => void deleteEvent(event.id)} />)}</div></section>
      </div>
      {showForm && <EventFormModal form={form} editing={Boolean(editingId)} loading={loading} error={error} onChange={setForm} onSubmit={saveEvent} onClose={() => setShowForm(false)} />}
    </main>
  )
}
