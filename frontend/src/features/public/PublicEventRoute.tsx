import { useEffect, useState } from 'react'
import type { EventItem } from '../../types/event'
import { apiRequest } from '../../lib/api'
import { RegistrationPage } from './RegistrationPage'

type PublicEventRouteProps = { eventId: string; onBack: () => void }

export function PublicEventRoute({ eventId, onBack }: PublicEventRouteProps) {
  const [event, setEvent] = useState<EventItem | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    async function load() {
      try { setEvent(await apiRequest<EventItem>(`/events/${eventId}`, null)) }
      catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load this event') }
    }
    void load()
  }, [eventId])
  if (error) return <main className="grid min-h-screen place-items-center bg-cyan-50 p-6 text-center text-sm text-rose-600">{error}</main>
  if (!event) return <main className="grid min-h-screen place-items-center bg-cyan-50 text-sm text-slate-500">Loading event...</main>
  if (event.registrationOpen === false) return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><p className="text-xs font-bold tracking-[0.2em] text-rose-500">REGISTRATION CLOSED</p><h1 className="mt-3 font-display text-3xl font-semibold text-cyan-950">Registration is closed.</h1><p className="mt-3 text-sm text-slate-500">This event is no longer accepting registrations.</p><button onClick={onBack} className="mt-6 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700">Back to events</button></div></main>
  return <RegistrationPage event={event} onBack={onBack} />
}
