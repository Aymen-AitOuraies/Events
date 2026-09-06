
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ScanLine,
  XCircle,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { Sidebar } from '../../components/Sidebar'
import { apiRequest } from '../../lib/api'
import type { EventItem } from '../../types/event'

type CheckInPageProps = {
  token: string
  events: EventItem[]
  onBack: () => void
  onSignout: () => void
}

export function CheckInPage({
  token,
  events,
  onBack,
  onSignout,
}: CheckInPageProps) {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const [manualToken, setManualToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)

  const [checkInResult, setCheckInResult] = useState<
    'success' | 'error' | null
  >(null)

  const [checkInError, setCheckInError] = useState('')

  const scanner = useRef<Html5Qrcode | null>(null)

  async function checkIn(qrToken: string) {
    if (!eventId || !qrToken.trim()) return

    setError('')
    setMessage('')
    setCheckInResult(null)
    setCheckInError('')

    try {
      await apiRequest(
        `/events/${eventId}/registrations/check-in`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            qrToken: qrToken.trim(),
          }),
        },
      )

      setMessage('Registration checked in successfully.')
      setManualToken('')

      setCheckInResult('success')

      setTimeout(() => {
        setCheckInResult(null)
      }, 2500)
    } catch (caught) {
      const errorMessage =
        caught instanceof Error
          ? caught.message
          : 'Could not check in this registration'

      setError(errorMessage)
      setCheckInError(errorMessage)
      setCheckInResult('error')

      setTimeout(() => {
        setCheckInResult(null)
      }, 3500)
    }
  }

  async function stopScanner() {
    if (!scanner.current) {
      setScanning(false)
      return
    }

    try {
      await scanner.current.stop()
      scanner.current.clear()
    } catch (caught) {
      console.error('Could not stop scanner:', caught)
    }

    scanner.current = null
    setScanning(false)
  }

  async function startScanner() {
    setError('')
    setMessage('')
    setCheckInResult(null)
    setCheckInError('')
    setScanning(true)

    try {
      // Get the actual cameras available on the device.
      // This is more reliable on PC than facingMode: "environment".
      const cameras = await Html5Qrcode.getCameras()

      if (!cameras || cameras.length === 0) {
        throw new Error('No camera found')
      }

      console.log('Available cameras:', cameras)

      // Prefer a rear camera when one exists.
      // On PC this normally falls back to the webcam.
      const preferredCamera =
        cameras.find((camera) =>
          /back|rear|environment/i.test(camera.label),
        ) ?? cameras[0]

      console.log('Using camera:', preferredCamera)

      const nextScanner = new Html5Qrcode('qr-reader')

      scanner.current = nextScanner

      await nextScanner.start(
        preferredCamera.id,
        {
          fps: 10,
          qrbox: {
            width: 230,
            height: 230,
          },
        },
        async (decodedText) => {
          console.log('QR code detected:', decodedText)

          await stopScanner()
          await checkIn(decodedText)
        },
        () => undefined,
      )

      console.log('QR scanner started successfully')
    } catch (caught) {
      console.error('QR scanner error:', caught)

      const errorMessage =
        caught instanceof Error
          ? caught.message
          : 'Camera access was unavailable.'

      setError(
        'Camera access was unavailable. Use the manual token field instead.',
      )

      setCheckInError(errorMessage)
      setCheckInResult('error')

      setScanning(false)
      scanner.current = null

      setTimeout(() => {
        setCheckInResult(null)
      }, 3500)
    }
  }

  useEffect(() => {
    return () => {
      if (scanner.current) {
        void scanner.current.stop().catch(() => undefined)
      }
    }
  }, [])

  return (
    <main className="relative flex min-h-screen bg-[#eef2ff] text-slate-700">
      <Sidebar onSignout={onSignout} />

      <div className="min-w-0 flex-1 bg-white md:m-4 md:ml-0 md:rounded-2xl md:shadow-xl md:shadow-cyan-950/10">
        <header className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 sm:px-7">
          <button
            title="Back to events"
            onClick={onBack}
            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-700"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="font-display text-sm font-semibold text-slate-800">
            Check in guests
          </h1>
        </header>

        <section className="mx-auto max-w-2xl px-5 py-10 sm:px-10 sm:py-14">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-600">
              ATTENDANCE / SCANNER
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold text-cyan-950">
              Scan a registration QR code.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Choose the event, then scan the guest's confirmation code to mark
              them as checked in.
            </p>
          </div>

          <div className="mt-9 rounded-2xl border border-cyan-100 bg-cyan-50/30 p-5 sm:p-7">
            <label className="block text-sm font-semibold text-cyan-950">
              Event

              <select
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-cyan-100 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-cyan-500"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>

            {/* Camera container */}
            <div
              id="qr-reader"
              className="mt-5 min-h-[320px] overflow-hidden rounded-xl bg-cyan-950 empty:hidden"
            />

            {!scanning && (
              <button
                onClick={() => void startScanner()}
                disabled={!eventId}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3.5 font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 disabled:opacity-50"
              >
                <Camera size={18} />
                Start camera scanner
              </button>
            )}

            {scanning && (
              <button
                onClick={() => void stopScanner()}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-white py-3.5 font-bold text-cyan-700 transition hover:bg-cyan-50"
              >
                <ScanLine size={18} />
                Stop scanner
              </button>
            )}

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-cyan-100" />
              or enter token manually
              <span className="h-px flex-1 bg-cyan-100" />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                void checkIn(manualToken)
              }}
              className="flex gap-2"
            >
              <input
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                placeholder="Paste QR token"
                className="min-w-0 flex-1 rounded-lg border border-cyan-100 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-500"
              />

              <button
                title="Check in token"
                className="grid size-12 shrink-0 place-items-center rounded-lg bg-cyan-950 text-white transition hover:bg-cyan-800"
              >
                <ClipboardCheck size={18} />
              </button>
            </form>

            {message && (
              <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 size={17} />
                {message}
              </p>
            )}

            {error && (
              <p className="mt-5 text-sm text-rose-600">
                {error}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Check-in result animation */}
      {checkInResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="flex min-w-[280px] flex-col items-center rounded-2xl bg-white px-8 py-8 text-center shadow-2xl">
            {checkInResult === 'success' ? (
              <>
                <div className="flex size-20 animate-[bounce_0.5s_ease-out] items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2
                    size={52}
                    className="text-emerald-500"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-emerald-600">
                  Check-in successful
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Registration checked in successfully.
                </p>
              </>
            ) : (
              <>
                <div className="flex size-20 animate-[bounce_0.5s_ease-out] items-center justify-center rounded-full bg-rose-100">
                  <XCircle
                    size={52}
                    className="text-rose-500"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-rose-600">
                  Check-in failed
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {checkInError}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

// ### One small CSS fix

// Keep this in your global CSS so the actual camera video generated by `html5-qrcode` fills the scanner area:

// ```css
// #qr-reader video {
//   display: block !important;
//   width: 100% !important;
//   height: 320px !important;
//   object-fit: cover !important;
// }
