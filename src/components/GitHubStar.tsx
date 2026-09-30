import { Star } from 'lucide-react'
import { useI18n } from '../i18n/i18n.ts'

/** The project's code; a star there helps others find it. */
export const REPO_URL = 'https://github.com/sinangumuskabak-sys/learn-platform'

/** GitHub's mark (lucide has no brand icons). */
function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

/** In the top bar: the GitHub mark and a star, next to the language and theme switches. */
export function StarLink() {
  const { t } = useI18n()
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t('github.star')}
      title={t('github.star')}
      className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <GitHubMark />
      <Star size={14} aria-hidden className="hidden sm:block" />
    </a>
  )
}

/** On the home page: it is free and open, and a star helps. */
export function StarCard() {
  const { t } = useI18n()
  return (
    <aside className="mt-6 flex max-w-2xl flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
      <span className="min-w-0 flex-1 basis-60">{t('github.ask')}</span>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 font-medium text-accent-fg hover:opacity-90"
      >
        <GitHubMark />
        <Star size={14} aria-hidden />
        {t('github.starButton')}
      </a>
    </aside>
  )
}
