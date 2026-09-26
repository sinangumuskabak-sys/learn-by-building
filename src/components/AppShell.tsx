import { GraduationCap } from 'lucide-react'
import clsx from 'clsx'
import { Link, NavLink, Outlet } from 'react-router'
import { ThemeToggle } from './ThemeToggle'

const nav = [
  { to: '/', label: 'Catalog', end: true },
  { to: '/skills', label: 'Skills', end: false },
  { to: '/settings', label: 'Settings', end: false },
]

export function AppShell() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <GraduationCap size={22} className="text-accent" />
            <span>Learn Platform</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'rounded-lg px-3 py-1.5',
                    isActive ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
