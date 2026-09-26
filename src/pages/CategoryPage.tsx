import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { catalog, categoryChallenges } from '../content/catalog.ts'
import { CategoryIcon, StatusIcon, TypeIcon } from '../components/icons.tsx'
import { Badge, Page, ProgressBar } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { statusOf, useProgress } from '../progress/progress.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

export function CategoryPage() {
  const { categoryId } = useParams()
  const { t, l } = useI18n()
  const progress = useProgress()
  const category = catalog.curriculum.categories.find((c) => c.id === categoryId)
  if (!category) return <NotFoundPage title={t('category.notFound')} />

  const items = categoryChallenges(category)
  const passed = items.filter((c) => statusOf(progress, c.id) === 'passed').length

  return (
    <Page className="max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} aria-hidden />
        {t('category.back')}
      </Link>
      <header className="mt-4 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <CategoryIcon name={category.icon} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{l(category.title)}</h1>
          <p className="mt-1 text-muted">{l(category.description)}</p>
        </div>
      </header>
      {items.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <ProgressBar value={passed} max={items.length} label={l(category.title)} />
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {passed}/{items.length}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted">
          {t('category.empty')}
        </p>
      ) : (
        <ol className="mt-8 space-y-8">
          {category.modules.map((module, moduleIndex) => (
            <li key={module.id}>
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-semibold text-accent tabular-nums">
                  {String(moduleIndex + 1).padStart(2, '0')}
                </span>
                <h2 className="text-lg font-semibold tracking-tight">{l(module.title)}</h2>
                <span className="text-sm text-muted">
                  {t('category.challenges', { count: module.challenges.length })}
                </span>
              </div>
              {module.description && <p className="mt-1 text-sm text-muted">{l(module.description)}</p>}
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {module.challenges.map((id) => {
                  const entry = catalog.challenges.get(id)
                  if (!entry) return null
                  const { challenge } = entry
                  const status = statusOf(progress, id)
                  return (
                    <li key={id}>
                      <Link
                        to={`/learn/${id}`}
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
                      >
                        <StatusIcon status={status} label={t(`status.${status}`)} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{challenge.title}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                            <TypeIcon type={challenge.type} size={13} />
                            {t(`type.${challenge.type}`)}
                          </span>
                        </span>
                        <Badge tone={status === 'passed' ? 'success' : 'neutral'}>
                          <span className="hidden sm:inline">{t(`level.${challenge.level}` as `level.0`)} · </span>
                          L{challenge.level}
                        </Badge>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </Page>
  )
}
