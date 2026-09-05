import { useEffect, useState } from 'react'
import { AuthForm } from './features/auth/AuthForm'
import { EventsDashboard } from './features/events/EventsDashboard'
import { PublicEventRoute } from './features/public/PublicEventRoute'
import { PublicEventsPage } from './features/public/PublicEventsPage'
import type { EventItem } from './types/event'

function getRoute() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'admin') return { page: 'admin' as const }
  if (parts[0] === 'events' && parts[1]) return { page: 'event' as const, id: parts[1] }
  return { page: 'home' as const }
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [token, setToken] = useState(() => localStorage.getItem('alc-events-token'))

  useEffect(() => {
    const onPopState = () => setRoute(getRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function navigate(path: string) {
    window.history.pushState({}, '', path)
    setRoute(getRoute())
  }
  function authenticated(accessToken: string) { localStorage.setItem('alc-events-token', accessToken); setToken(accessToken) }
  function signout() { localStorage.removeItem('alc-events-token'); setToken(null); navigate('/') }

  if (route.page === 'admin') return token ? <EventsDashboard token={token} onSignout={signout} /> : <AuthForm onAuthenticated={authenticated} />
  if (route.page === 'event') return <PublicEventRoute eventId={route.id} onBack={() => navigate('/')} />
  return <PublicEventsPage onAdmin={() => navigate('/admin')} onSelect={(event: EventItem) => navigate(`/events/${event.id}`)} />
}
