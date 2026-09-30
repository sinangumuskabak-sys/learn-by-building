import { Star } from 'lucide-react'
import { useI18n } from '../i18n/i18n.ts'
import { compact, REPO_URL, useStars } from '../lib/github.ts'

/** GitHub's mark (lucide has no brand icons). */
export function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

/** In the top bar, like other open-source sites: the GitHub mark, "Star" and the live count. */
export function StarLink() {
  const { t } = useI18n()
  const stars = useStars()
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t('github.star')}
      title={t('github.star')}
      className="mr-1 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:border-accent/60 hover:bg-surface-2"
    >
      <GitHubMark size={15} />
      <Star size={13} aria-hidden className="text-amber-500" />
      <span className="hidden sm:inline">{t('github.starShort')}</span>
      {stars !== null && <span className="tabular-nums text-muted">{compact(stars)}</span>}
    </a>
  )
}

/** On the home page: it is free and open source, and a star helps others find it. */
export function StarCard() {
  const { t } = useI18n()
  const stars = useStars()
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
        {stars !== null && <span className="rounded bg-black/15 px-1.5 tabular-nums">{compact(stars)}</span>}
      </a>
    </aside>
  )
}

/** At the foot of the home page: open source, where the code is, how to help. */
export function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-6 text-sm text-muted">
      <span>{t('github.footer')}</span>
      <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-fg">
        <GitHubMark size={14} /> GitHub
      </a>
      <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-fg">
        <Star size={14} aria-hidden /> {t('github.starButton')}
      </a>
      <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer" className="hover:text-fg">
        {t('github.issues')}
      </a>
      <a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="hover:text-fg">
        {t('github.contribute')}
      </a>
    </footer>
  )
}
