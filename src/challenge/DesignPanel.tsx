import clsx from 'clsx'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import type { Challenge } from '../content/schema.ts'
import { InlineMarkdown } from '../components/Markdown.tsx'
import { Button } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useDebouncedEffect } from '../lib/hooks.ts'
import { progressActions, useProgress } from '../progress/progress.ts'

const MIN_ANSWER_LENGTH = 40

/**
 * Free-text design answer with a self-review rubric. AI review can plug in here later; for now the learner
 * checks their own answer against the criteria.
 */
export function DesignPanel({ challenge }: { challenge: Challenge }) {
  const { t } = useI18n()
  const saved = useProgress().challenges[challenge.id]
  const [answer, setAnswer] = useState(saved?.answer ?? '')
  const [ticked, setTicked] = useState<number[]>(saved?.rubric ?? [])
  const [dirty, setDirty] = useState(false)

  useDebouncedEffect(answer, 500, (value) => {
    if (dirty) progressActions.saveAnswer(challenge.id, value)
  })

  const toggle = (index: number) => {
    const next = ticked.includes(index) ? ticked.filter((i) => i !== index) : [...ticked, index]
    setTicked(next)
    progressActions.saveRubric(challenge.id, next)
  }

  const ready = answer.trim().length >= MIN_ANSWER_LENGTH && ticked.length === challenge.rubric.length
  const done = saved?.status === 'passed'

  return (
    <div className="space-y-6">
      <section>
        <label htmlFor={`${challenge.id}-answer`} className="text-xs font-semibold tracking-wide text-muted uppercase">
          {t('challenge.yourAnswer')}
        </label>
        <textarea
          id={`${challenge.id}-answer`}
          value={answer}
          onChange={(e) => {
            setDirty(true)
            setAnswer(e.target.value)
          }}
          placeholder={t('challenge.answerPlaceholder')}
          rows={12}
          className="mt-2 w-full resize-y rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-relaxed outline-none focus:border-accent"
        />
      </section>
      <section>
        <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{t('challenge.rubric')}</h2>
        <p className="mt-1 text-sm text-muted">{t('challenge.rubricHint')}</p>
        <ul className="mt-3 space-y-2">
          {challenge.rubric.map((criterion, index) => (
            <li key={index}>
              <label
                className={clsx(
                  'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                  ticked.includes(index) ? 'border-success/40 bg-success/8' : 'border-border hover:bg-surface-2',
                )}
              >
                <input
                  type="checkbox"
                  checked={ticked.includes(index)}
                  onChange={() => toggle(index)}
                  className="mt-0.5 size-4 accent-[var(--success)]"
                />
                <InlineMarkdown source={criterion} />
              </label>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex items-center gap-3">
        <Button variant="primary" disabled={!ready || done} onClick={() => progressActions.markPassed(challenge.id)}>
          {t('challenge.markDone')}
        </Button>
        {done && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 size={16} aria-hidden />
            {t('challenge.done')}
          </p>
        )}
      </div>
    </div>
  )
}
