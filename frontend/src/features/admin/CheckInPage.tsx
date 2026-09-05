import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, CheckCircle2, ClipboardCheck, ScanLine } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { Sidebar } from '../../components/Sidebar'
import { apiRequest } from '../../lib/api'
import type { EventItem } from '../../types/event'

type CheckInPageProps = { token: string; events: EventItem[]; onBack: () => void; onSignout: () => void }

export function CheckInPage({ token, events, onBack, onSignout }: CheckInPageProps) {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const [manualToken, setManualToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const scanner = useRef<Html5Qrcode | null>(null)

  async function checkIn(qrToken: string) {
    if (!eventId || !qrToken.trim()) return
    setError(''); setMessage('')
    try { await apiRequest(`/events/${eventId}/registrations/check-in`, token, { method: 'POST', body: JSON.stringify({ qrToken: qrToken.trim() }) }); setMessage('Registration checked in successfully.'); setManualToken('') }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not check in this registration') }
  }
  async function stopScanner() { if (!scanner.current) return; try { await scanner.current.stop(); scanner.current.clear() } catch { } scanner.current = null; setScanning(false) }
  async function startScanner() {
    setError(''); setMessage(''); setScanning(true)
    const nextScanner = new Html5Qrcode('qr-reader'); scanner.current = nextScanner
    try { await nextScanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 230, height: 230 } }, (decodedText) => { void checkIn(decodedText); void stopScanner() }, () => undefined) }
    catch { setError('Camera access was unavailable. Use the manual token field instead.'); setScanning(false); scanner.current = null }
  }
  useEffect(() => () => { if (scanner.current) void scanner.current.stop() }, [])

  return <main className="flex min-h-screen bg-[#eef2ff] text-slate-700"><Sidebar onSignout={onSignout} /><div className="min-w-0 flex-1 bg-white md:m-4 md:ml-0 md:rounded-2xl md:shadow-xl md:shadow-cyan-950/10"><header className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 sm:px-7"><button title="Back to events" onClick={onBack} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"><ArrowLeft size={18} /></button><h1 className="font-display text-sm font-semibold text-slate-800">Check in guests</h1></header><section className="mx-auto max-w-2xl px-5 py-10 sm:px-10 sm:py-14"><div className="text-center"><p className="text-xs font-bold tracking-[0.2em] text-cyan-600">ATTENDANCE / SCANNER</p><h2 className="mt-3 font-display text-3xl font-semibold text-cyan-950">Scan a registration QR code.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Choose the event, then scan the guest's confirmation code to mark them as checked in.</p></div><div className="mt-9 rounded-2xl border border-cyan-100 bg-cyan-50/30 p-5 sm:p-7"><label className="block text-sm font-semibold text-cyan-950">Event<select value={eventId} onChange={(event) => setEventId(event.target.value)} className="mt-2 w-full rounded-lg border border-cyan-100 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-cyan-500">{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label><div id="qr-reader" className="mt-5 overflow-hidden rounded-xl bg-cyan-950 empty:hidden" />{!scanning && <button onClick={() => void startScanner()} disabled={!eventId} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3.5 font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:opacity-50"><Camera size={18} /> Start camera scanner</button>}{scanning && <button onClick={() => void stopScanner()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-white py-3.5 font-bold text-cyan-700 transition hover:bg-cyan-50"><ScanLine size={18} /> Stop scanner</button>}<div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-cyan-100" />or enter token manually<span className="h-px flex-1 bg-cyan-100" /></div><form onSubmit={(event) => { event.preventDefault(); void checkIn(manualToken) }} className="flex gap-2"><input value={manualToken} onChange={(event) => setManualToken(event.target.value)} placeholder="Paste QR token" className="min-w-0 flex-1 rounded-lg border border-cyan-100 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-500" /><button title="Check in token" className="grid size-12 shrink-0 place-items-center rounded-lg bg-cyan-950 text-white transition hover:bg-cyan-800"><ClipboardCheck size={18} /></button></form>{message && <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 size={17} />{message}</p>}{error && <p className="mt-5 text-sm text-rose-600">{error}</p>}</div></section></div></main>
}
