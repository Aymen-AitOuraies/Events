import type { ChangeEvent, FormEvent } from 'react'
import { X } from 'lucide-react'
import type { EventForm } from '../../types/event'

type EventFormModalProps = {
  form: EventForm
  editing: boolean
  loading: boolean
  error: string
  onChange: (form: EventForm) => void
  onSubmit: (event: FormEvent) => void
  onClose: () => void
}

export function EventFormModal({ form, editing, loading, error, onChange, onSubmit, onClose }: EventFormModalProps) {
  const field = (key: keyof EventForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...form, [key]: event.target.value })
  return <div className="fixed inset-0 z-10 overflow-y-auto bg-cyan-950/50 p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form onSubmit={onSubmit} className="mx-auto grid w-full max-w-xl gap-5 rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><header className="flex items-start justify-between"><div><p className="text-xs font-bold tracking-[0.2em] text-cyan-600">{editing ? 'EDIT EVENT' : 'NEW EVENT'}</p><h2 className="mt-2 font-display text-2xl font-semibold text-cyan-950">{editing ? 'Refine the details.' : 'Set the scene.'}</h2></div><button type="button" title="Close" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-cyan-50 hover:text-cyan-700"><X size={19} /></button></header><label className="text-sm font-semibold text-cyan-950">Event title<input required maxLength={255} value={form.title} onChange={field('title')} className="mt-2 w-full rounded-lg border border-cyan-100 bg-cyan-50/30 px-3 py-3 font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" placeholder="Community gathering" /></label><label className="text-sm font-semibold text-cyan-950">Description<textarea rows={3} value={form.description} onChange={field('description')} className="mt-2 w-full resize-none rounded-lg border border-cyan-100 bg-cyan-50/30 px-3 py-3 font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" placeholder="What should people know?" /></label><label className="text-sm font-semibold text-cyan-950">Location<input value={form.location} onChange={field('location')} className="mt-2 w-full rounded-lg border border-cyan-100 bg-cyan-50/30 px-3 py-3 font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" placeholder="Main hall, online, ..." /></label><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-cyan-950">Starts<input required type="datetime-local" value={form.startDate} onChange={field('startDate')} className="mt-2 w-full rounded-lg border border-cyan-100 bg-cyan-50/30 px-3 py-3 font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" /></label><label className="text-sm font-semibold text-cyan-950">Ends<input required type="datetime-local" value={form.endDate} onChange={field('endDate')} className="mt-2 w-full rounded-lg border border-cyan-100 bg-cyan-50/30 px-3 py-3 font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" /></label></div>{error && <p className="text-sm text-rose-600">{error}</p>}<button disabled={loading} className="rounded-lg bg-cyan-600 py-3.5 font-bold text-white transition hover:bg-cyan-700 disabled:opacity-60">{loading ? 'Saving...' : editing ? 'Save changes' : 'Create event'}</button></form></div>
}
