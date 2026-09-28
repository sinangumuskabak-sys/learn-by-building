import { Compass, TriangleAlert } from 'lucide-react'
import { Link, useRouteError } from 'react-router'
import { buttonClass } from '../components/button-class.ts'
import { Page } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle } from '../lib/hooks.ts'

export function NotFoundPage({ title }: { title?: string }) {
  const { t } = useI18n()
  useDocumentTitle(title ?? t('notFound.title'))
  return (
    <Page className="flex flex-col items-center py-20 text-center">
      <Compass size={40} className="text-muted" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{title ?? t('notFound.title')}</h1>
      <Link to="/" className={`${buttonClass('secondary')} mt-6`}>
        {t('notFound.back')}
      </Link>
    </Page>
  )
}

/** Shown in place of a page that failed to load or render (for example an old chunk after an update); the header stays. */
export function RouteErrorPage() {
  const { t } = useI18n()
  const error = useRouteError()
  useDocumentTitle(t('error.title'))
  console.error(error)
  return (
    <Page className="flex flex-col items-center py-20 text-center">
      <TriangleAlert size={40} className="text-muted" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('error.title')}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{t('error.body')}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary')}>
          {t('error.reload')}
        </button>
        <Link to="/" className={buttonClass('secondary')}>
          {t('notFound.back')}
        </Link>
      </div>
    </Page>
  )
}
