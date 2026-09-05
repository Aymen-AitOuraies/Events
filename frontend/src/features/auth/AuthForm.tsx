import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react'
import { Brand } from '../../components/Brand'
import { signIn } from '../../lib/api'

type AuthFormProps = { onAuthenticated: (token: string) => void }

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn(credentials.username, credentials.password)
      onAuthenticated(result.accessToken)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_85%_5%,#cffafe,transparent_32%),linear-gradient(135deg,#ecfeff,#f8fafc)] p-5">
      <section className="w-full max-w-md rounded-2xl border border-cyan-100 bg-white p-7 shadow-2xl shadow-cyan-900/10 sm:p-10">
        <Brand />
        <div className="mt-12">
          <p className="text-xs font-bold tracking-[0.2em] text-cyan-600">ALC EVENTS / CONSOLE</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cyan-950">Make every gathering count.</h1>
          <p className="mt-4 leading-7 text-slate-500">Sign in to shape the next moment your community remembers.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold text-cyan-950">Username<div className="relative mt-2"><UserRound className="absolute left-3 top-3.5 text-cyan-500" size={17} /><input required value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} className="w-full rounded-lg border border-cyan-100 bg-cyan-50/30 py-3 pl-10 pr-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" placeholder="you@example.com" /></div></label>
          <label className="block text-sm font-semibold text-cyan-950">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3 top-3.5 text-cyan-500" size={17} /><input required type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} className="w-full rounded-lg border border-cyan-100 bg-cyan-50/30 py-3 pl-10 pr-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10" placeholder="••••••••" /></div></label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3.5 font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in...' : 'Enter workspace'} {!loading && <ArrowRight size={17} />}</button>
        </form>
      </section>
    </main>
  )
}
