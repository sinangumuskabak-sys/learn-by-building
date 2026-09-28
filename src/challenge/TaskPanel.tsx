import clsx from 'clsx'
import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Challenge } from '../content/schema.ts'
import { TypeIcon } from '../components/icons.tsx'
import { InlineMarkdown, Markdown } from '../components/Markdown.tsx'
import { Badge } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import type { RunResult } from '../runners/types.ts'

export function ChallengeMeta({ challenge }: { challenge: Challenge }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="accent">
        <TypeIcon type={challenge.type} size={13} />
        {t(`type.${challenge.type}`)}
      </Badge>
      <Badge title={t(`level.${challenge.level}.hint` as `level.0.hint`)}>
        {t('level.label', { level: challenge.level })} · {t(`level.${challenge.level}` as `level.0`)}
      </Badge>
    </div>
  )
}

export function TestList({ challenge, result }: { challenge: Challenge; result: RunResult | null }) {
  const { t } = useI18n()
  return (
    <ul className="space-y-2">
      {challenge.tests.map((test, index) => {
        const outcome = result?.tests[index]
        return (
          <li
            key={index}
            className={clsx(
              'flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm',
              !outcome && 'border-border bg-surface',
              outcome?.passed && 'border-success/30 bg-success/8',
              outcome && !outcome.passed && 'border-danger/30 bg-danger/8',
            )}
          >
            {!outcome ? (
              <Circle size={17} className="mt-0.5 shrink-0 text-muted" aria-label={t('status.new')} />
            ) : outcome.passed ? (
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" aria-label={t('status.passed')} />
            ) : (
              <XCircle size={17} className="mt-0.5 shrink-0 text-danger" aria-label="failed" />
            )}
            <div className="min-w-0 flex-1">
              <InlineMarkdown source={test.text} />
              {outcome?.error && (
                <pre className="mt-1.5 overflow-x-auto font-mono text-xs whitespace-pre-wrap text-danger">
                  {outcome.error}
                </pre>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Left column: what the challenge is about and what to do. */
export function TaskPanel({ challenge, children }: { challenge: Challenge; children?: ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="space-y-6 p-5 sm:p-6">
      <div>
        <ChallengeMeta challenge={challenge} />
        <h1 className="mt-3 text-xl font-bold tracking-tight text-balance">{challenge.title}</h1>
      </div>
      <Markdown source={challenge.description} />
      {challenge.instructions && (
        <section className="rounded-xl border border-accent/25 bg-accent/5 p-4">
          <h2 className="text-xs font-semibold tracking-wide text-accent uppercase">{t('challenge.instructions')}</h2>
          <Markdown source={challenge.instructions} className="mt-2" />
        </section>
      )}
      {children}
    </div>
  )
}
