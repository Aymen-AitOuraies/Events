import { CalendarDays, LogOut } from 'lucide-react'
import { Brand } from './Brand'

type SidebarProps = { onSignout: () => void }

export function Sidebar({ onSignout }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-20 shrink-0 flex-col bg-cyan-950 text-cyan-50 md:flex lg:w-56">
        <div className="flex h-16 items-center justify-center border-b border-white/10 lg:justify-start lg:px-5">
          <Brand compact />
        </div>
        <nav className="flex-1 p-3 lg:p-4">
          <div className="flex items-center justify-center gap-3 rounded-lg bg-cyan-800 px-3 py-3 text-sm font-semibold lg:justify-start">
            <CalendarDays size={18} />
            <span className="hidden lg:inline">My events</span>
          </div>
        </nav>
        <button onClick={onSignout} title="Sign out" className="m-3 flex items-center justify-center gap-3 rounded-lg px-3 py-3 text-sm text-cyan-200 transition hover:bg-cyan-900 hover:text-white lg:justify-start lg:m-4">
          <LogOut size={18} />
          <span className="hidden lg:inline">Sign out</span>
        </button>
      </aside>
      <button onClick={onSignout} title="Sign out" className="fixed bottom-5 right-5 z-20 grid size-12 place-items-center rounded-full bg-cyan-950 text-cyan-50 shadow-xl shadow-cyan-950/25 transition hover:bg-cyan-800 md:hidden">
        <LogOut size={18} />
      </button>
    </>
  )
}
