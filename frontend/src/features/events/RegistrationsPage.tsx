import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { ArrowLeft, CalendarDays, Download, Mail, Trash2, Users } from 'lucide-react'
import { Sidebar } from '../../components/Sidebar'
import { apiRequest } from '../../lib/api'
import type { EventItem } from '../../types/event'
import type { FormField } from '../../types/form-field'
import type { Registration, RegistrationDetails } from '../../types/registration'

type RegistrationsPageProps = { event: EventItem; token: string; onBack: () => void; onSignout: () => void; onCheckIn?: () => void }
type Attendee = Registration & { name: string; email: string; answers: Record<string, string> }

export function RegistrationsPage({ event, token, onBack, onSignout, onCheckIn }: RegistrationsPageProps) {
  const [registrations, setRegistrations] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(event.registrationOpen !== false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [list, eventFields] = await Promise.all([apiRequest<Registration[]>(`/events/${event.id}/registrations`, token), apiRequest<FormField[]>(`/events/${event.id}/form-fields`, token)])
        const details = await Promise.all(list.map((registration) => apiRequest<RegistrationDetails>(`/events/${event.id}/registrations/${registration.id}`, token)))
        const byId = new Map(eventFields.map((field) => [field.id, field.label]))
        setRegistrations(details.map((item) => ({ ...item, name: item.answers.find((answer) => byId.get(answer.fieldId)?.toLowerCase() === 'full name')?.value ?? 'Unnamed guest', email: item.answers.find((answer) => byId.get(answer.fieldId)?.toLowerCase() === 'email' || byId.get(answer.fieldId)?.toLowerCase().includes('email'))?.value ?? 'No email', answers: Object.fromEntries(item.answers.map((answer) => [byId.get(answer.fieldId) ?? answer.fieldId, answer.value])) })))
      } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load registrations') }
      finally { setLoading(false) }
    }
    void load()
  }, [event.id, token])

  async function toggleRegistration() {
    setBusy(true); setError('')
    try { const updated = await apiRequest<EventItem>(`/events/${event.id}`, token, { method: 'PATCH', body: JSON.stringify({ registrationOpen: !open }) }); setOpen(updated.registrationOpen !== false) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not update registration status') }
    finally { setBusy(false) }
  }
  async function removeRegistration(id: string) {
    if (!window.confirm('Remove this registration?')) return
    try { await apiRequest(`/events/${event.id}/registrations/${id}`, token, { method: 'DELETE' }); setRegistrations((current) => current.filter((item) => item.id !== id)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not remove registration') }
  }
  function exportExcel() {
    const rows = registrations.map((registration) => ({ Name: registration.name, Email: registration.email, Status: registration.checkedIn ? 'Checked in' : 'Registered', Registered: new Date(registration.createdAt).toLocaleString(), ...registration.answers }))
    const workbook = XLSX.utils.book_new(); const sheet = XLSX.utils.json_to_sheet(rows); XLSX.utils.book_append_sheet(workbook, sheet, 'Registrations'); XLSX.writeFile(workbook, `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-registrations.xlsx`)
  }
  const visible = registrations.filter((registration) => `${registration.name} ${registration.email}`.toLowerCase().includes(search.toLowerCase()))

  return <main className="flex min-h-screen bg-[#eef2ff] text-slate-700"><Sidebar onSignout={onSignout} onCheckIn={onCheckIn} /><div className="min-w-0 flex-1 bg-white md:m-4 md:ml-0 md:rounded-2xl md:shadow-xl md:shadow-cyan-950/10"><header className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 sm:px-7"><button title="Back to events" onClick={onBack} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-cyan-50 hover:text-cyan-700"><ArrowLeft size={18} /></button><span className="text-sm text-slate-400">My events /</span><h1 className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-slate-800">{event.title}</h1></header><section className="border-b border-slate-100 bg-cyan-50/30 px-5 py-8 sm:px-12 sm:py-10"><p className="text-xs font-bold tracking-[0.18em] text-cyan-600">EVENT ATTENDANCE</p><h2 className="mt-2 font-display text-3xl font-semibold text-cyan-950">Registrations</h2><p className="mt-2 text-sm leading-6 text-slate-500">See who is joining, manage access, and export the guest list.</p><div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500"><span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-cyan-600" />{new Date(event.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="flex items-center gap-1.5"><Users size={14} className="text-cyan-600" />{registrations.length} registered</span></div></section><section className="px-5 py-7 sm:px-12 sm:py-10"><div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-xl bg-cyan-50 font-display text-xl font-semibold text-cyan-700">{registrations.length}</div><div><p className="font-semibold text-cyan-950">Total registrations</p><p className="text-xs text-slate-500">{registrations.filter((item) => item.checkedIn).length} checked in</p></div></div><div className="flex flex-wrap gap-2"><button onClick={() => void toggleRegistration()} disabled={busy} className={`rounded-lg px-3 py-2.5 text-sm font-bold ${open ? 'border border-rose-200 text-rose-600 hover:bg-rose-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>{busy ? 'Updating...' : open ? 'Stop registration' : 'Resume registration'}</button><button onClick={exportExcel} disabled={!registrations.length} className="flex items-center gap-2 rounded-lg bg-cyan-950 px-3 py-2.5 text-sm font-bold text-white hover:bg-cyan-800 disabled:opacity-50"><Download size={16} /> Export Excel</button></div></div>{error && <p className="mb-4 text-sm text-rose-600">{error}</p>}{!loading && registrations.length > 0 && <input value={search} onChange={(input) => setSearch(input.target.value)} placeholder="Search guests" className="mb-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 sm:max-w-sm" />}{loading && <p className="text-sm text-slate-500">Loading registrations...</p>}{!loading && registrations.length === 0 && <div className="rounded-xl border border-dashed border-cyan-200 bg-cyan-50/30 py-16 text-center"><Users className="mx-auto text-cyan-500" size={32} /><p className="mt-3 font-semibold text-cyan-950">No registrations yet.</p></div>}{!loading && visible.length > 0 && <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">Registration details</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((registration) => <tr key={registration.id} className="hover:bg-cyan-50/30"><td className="px-4 py-4"><p className="font-semibold text-cyan-950">{registration.name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Mail size={13} />{registration.email}</p></td><td className="max-w-sm px-4 py-4 text-xs text-slate-500">{Object.entries(registration.answers).filter(([label]) => label.toLowerCase() !== 'full name' && label.toLowerCase() !== 'email').map(([label, value]) => <p key={label}><span className="font-semibold text-slate-600">{label}:</span> {value}</p>)}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${registration.checkedIn ? 'text-emerald-600' : 'text-cyan-700'}`}><span className="size-1.5 rounded-full bg-current" />{registration.checkedIn ? 'Checked in' : 'Registered'}</span></td><td className="px-4 py-4 text-right"><button title="Remove registration" onClick={() => void removeRegistration(registration.id)} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>}</section></div></main>
}
