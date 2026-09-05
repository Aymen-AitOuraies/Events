import { useState } from 'react'
import { AuthForm } from './features/auth/AuthForm'
import { EventsDashboard } from './features/events/EventsDashboard'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('alc-events-token'))

  function authenticated(accessToken: string) {
    localStorage.setItem('alc-events-token', accessToken)
    setToken(accessToken)
  }

  function signout() {
    localStorage.removeItem('alc-events-token')
    setToken(null)
  }

  return token ? <EventsDashboard token={token} onSignout={signout} /> : <AuthForm onAuthenticated={authenticated} />
}
