import { Compass } from 'lucide-react'
import { Link } from 'react-router'
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
