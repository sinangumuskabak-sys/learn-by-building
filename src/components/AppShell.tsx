import clsx from 'clsx'
import { BookOpen, Gamepad2, GraduationCap, Languages, LayoutGrid, type LucideIcon, Moon, Network, Settings, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { useI18n } from '../i18n/i18n.ts'
import type { MessageKey } from '../i18n/messages.ts'
import { themeStore, useTheme } from '../lib/settings.ts'
import { Maymun } from '../maymun/Maymun.tsx'
import { IconButton } from './ui.tsx'

// On narrow screens the items show only their icon, so four sections still fit next to the toggles.
const nav: { to: string; label: MessageKey; end: boolean; icon: LucideIcon }[] = [
  { to: '/', label: 'nav.catalog', end: true, icon: LayoutGrid },
  { to: '/games', label: 'nav.games', end: false, icon: Gamepad2 },
  { to: '/skills', label: 'nav.skills', end: false, icon: Network },
  { to: '/memory', label: 'nav.memory', end: false, icon: BookOpen },
  { to: '/settings', label: 'nav.settings', end: false, icon: Settings },
]

export function AppShell() {
  const { t, lang, setLang } = useI18n()
  const theme = useTheme()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // The memory vault follows progress from the start, not only once its page is opened.
  useEffect(() => {
    const start = () => void import('../vault/store.ts').then(({ startVault }) => startVault())
    const id = window.setTimeout(start, 1500)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        {t('nav.skipToContent')}
      </a>
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-surface/85 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 sm:gap-4">
          <Link to="/" aria-label={t('app.name')} className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg">
              <GraduationCap size={18} aria-hidden />
            </span>
            <span className="hidden sm:inline">{t('app.name')}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-0.5 text-sm" aria-label="Main">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={t(item.label)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors sm:px-3',
                    isActive ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:text-fg',
                  )
                }
              >
                <item.icon size={17} className="sm:hidden" aria-hidden />
                <span className="hidden sm:inline">{t(item.label)}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center">
            <IconButton
              label={lang === 'en' ? 'Türkçe' : 'English'}
              onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
            >
              <span className="flex items-center gap-1 text-xs font-semibold">
                <Languages size={16} aria-hidden />
                <span className="hidden sm:inline">{lang.toUpperCase()}</span>
              </span>
            </IconButton>
            <IconButton
              label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
              onClick={() => themeStore.set(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={0} data-maymun="page" className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Maymun />
    </div>
  )
}
