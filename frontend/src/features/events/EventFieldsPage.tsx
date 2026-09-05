import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, MapPin, Save } from 'lucide-react'
import { Sidebar } from '../../components/Sidebar'
import { apiRequest } from '../../lib/api'
import { optionFieldTypes, type FormField, type FormFieldDraft } from '../../types/form-field'
import type { EventItem } from '../../types/event'
import { FormFieldBuilder } from './FormFieldBuilder'

type EventFieldsPageProps = { event: EventItem; token: string; onBack: () => void; onSignout: () => void }

export function EventFieldsPage({ event, token, onBack, onSignout }: EventFieldsPageProps) {
  const [fields, setFields] = useState<FormFieldDraft[]>([])
  const [originalIds, setOriginalIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadFields() {
      try {
        const result = await apiRequest<FormField[]>(`/events/${event.id}/form-fields`, token)
        setFields(result.map(({ id, ...field }) => ({ id, ...field })))
        setOriginalIds(result.map((field) => field.id))
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not load registration fields')
      } finally { setLoading(false) }
    }
    void loadFields()
  }, [event.id, token])

  async function saveFields() {
    setSaving(true); setError(''); setSaved(false)
    try {
      await Promise.all(fields.map(({ id, label, type, required, options, position }) => apiRequest<FormField>(id ? `/events/${event.id}/form-fields/${id}` : `/events/${event.id}/form-fields`, token, { method: id ? 'PATCH' : 'POST', body: JSON.stringify({ label, type, required, position, ...(optionFieldTypes.includes(type) ? { options: (options ?? []).filter(Boolean) } : {}) }) })))
      await Promise.all(originalIds.filter((id) => !fields.some((field) => field.id === id)).map((id) => apiRequest(`/events/${event.id}/form-fields/${id}`, token, { method: 'DELETE' })))
      const refreshed = await apiRequest<FormField[]>(`/events/${event.id}/form-fields`, token)
      setFields(refreshed.map(({ id, ...field }) => ({ id, ...field })))
      setOriginalIds(refreshed.map((field) => field.id))
      setSaved(true)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save registration fields') }
    finally { setSaving(false) }
  }

  return <main className="flex min-h-screen bg-[#eef2ff] text-slate-700"><Sidebar onSignout={onSignout} /><div className="min-w-0 flex-1 bg-white md:m-4 md:ml-0 md:rounded-2xl md:shadow-xl md:shadow-cyan-950/10"><header className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 sm:px-7"><button title="Back to events" onClick={onBack} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"><ArrowLeft size={18} /></button><span className="text-sm text-slate-400">My events /</span><h1 className="truncate font-display text-sm font-semibold text-slate-800">{event.title}</h1></header><section className="border-b border-slate-100 bg-cyan-50/30 px-5 py-8 sm:px-12 sm:py-12"><p className="text-xs font-bold tracking-[0.18em] text-cyan-600">EVENT SETUP</p><h2 className="mt-2 font-display text-3xl font-semibold text-cyan-950">Registration form</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Choose the details guests should share when they register for this event.</p><div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-cyan-600" />{new Date(event.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>{event.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-cyan-600" />{event.location}</span>}</div></section><section className="max-w-3xl px-5 py-7 sm:px-12 sm:py-10">{loading && <p className="text-sm text-slate-500">Loading registration fields...</p>}{!loading && <><FormFieldBuilder fields={fields} onChange={(nextFields) => { setFields(nextFields); setSaved(false) }} /><div className="mt-7 flex items-center justify-end gap-4 border-t border-slate-100 pt-5">{error && <p className="mr-auto text-sm text-rose-600">{error}</p>}{saved && <p className="mr-auto text-sm text-emerald-600">Fields saved.</p>}<button onClick={() => void saveFields()} disabled={saving} className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:opacity-60"><Save size={16} />{saving ? 'Saving...' : 'Save fields'}</button></div></>}</section></div></main>
}
