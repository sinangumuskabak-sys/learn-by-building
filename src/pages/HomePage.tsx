import { ArrowRight, Search } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router'
import { catalog, categoryChallenges } from '../content/catalog.ts'
import { CategoryIcon, StatusIcon, TypeIcon } from '../components/icons.tsx'
import { buttonClass } from '../components/button-class.ts'
import { Badge, Page, ProgressBar } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle } from '../lib/hooks.ts'
import { statusOf, useProgress } from '../progress/progress.ts'

export function HomePage() {
  const { t, l, ct } = useI18n()
  useDocumentTitle('')
  const progress = useProgress()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const total = catalog.order.length
  const done = catalog.order.filter((id) => statusOf(progress, id) === 'passed').length
  // Resume the first unfinished challenge, preferring one already started.
  const resumeId =
    catalog.order.find((id) => statusOf(progress, id) === 'started') ??
    catalog.order.find((id) => statusOf(progress, id) !== 'passed')

  const matches = (text: string) => text.toLowerCase().includes(deferredQuery)
  const categories = catalog.curriculum.categories.filter(
    (c) => !deferredQuery || matches(l(c.title)) || matches(l(c.description)),
  )
  const challengeHits = deferredQuery
    ? catalog.order.map((id) => catalog.challenges.get(id)!).filter((e) => matches(ct(e.challenge)))
    : []

  return (
    <Page>
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-8 sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/15 blur-3xl"
        />
        <h1 className="relative max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t('home.title')}
        </h1>
        <p className="relative mt-3 max-w-2xl text-muted text-pretty">{t('home.subtitle')}</p>
        <div className="relative mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {resumeId && (
            <Link to={`/learn/${resumeId}`} className={buttonClass('primary')}>
              {done > 0 || statusOf(progress, resumeId) === 'started' ? t('home.continue') : t('home.start')}
              <ArrowRight size={16} aria-hidden />
            </Link>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-xs">
            <ProgressBar value={done} max={total} label={t('home.overall', { done, total })} />
            <span className="shrink-0 text-sm text-muted tabular-nums">
              {done}/{total}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:outline-2 focus-within:outline-accent">
        <Search size={18} className="text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('home.search')}
          aria-label={t('home.search')}
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {challengeHits.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-muted">{t('home.challengeResults')}</h2>
          <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {challengeHits.map(({ challenge, category }) => {
              const status = statusOf(progress, challenge.id)
              return (
                <li key={challenge.id}>
                  <Link
                    to={`/learn/${challenge.id}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2"
                  >
                    <StatusIcon status={status} label={t(`status.${status}`)} />
                    <span className="min-w-0 flex-1 truncate font-medium">{ct(challenge)}</span>
                    <span className="hidden text-muted sm:inline">{l(category.title)}</span>
                    <TypeIcon type={challenge.type} className="text-muted" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className={deferredQuery ? 'mb-2 text-sm font-semibold text-muted' : 'sr-only'}>{t('home.categories')}</h2>
        {categories.length === 0 && challengeHits.length === 0 ? (
          <p className="py-10 text-center text-muted">{t('home.noResults', { query })}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const items = categoryChallenges(category)
              const passed = items.filter((c) => statusOf(progress, c.id) === 'passed').length
              const number = catalog.curriculum.categories.indexOf(category) + 1
              return (
                <li key={category.id}>
                  <Link
                    to={`/c/${category.id}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                        <CategoryIcon name={category.icon} />
                      </span>
                      <span className="text-xs font-medium text-muted tabular-nums">
                        {String(number).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold tracking-tight group-hover:text-accent">{l(category.title)}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted">{l(category.description)}</p>
                    {items.length === 0 ? (
                      <div className="mt-4">
                        <Badge>{t('category.moduleSoon')}</Badge>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-3">
                        <ProgressBar value={passed} max={items.length} label={l(category.title)} />
                        <span className="shrink-0 text-xs text-muted tabular-nums">{`${passed}/${items.length}`}</span>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </Page>
  )
}
