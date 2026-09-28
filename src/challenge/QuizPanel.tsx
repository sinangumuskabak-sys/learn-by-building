import clsx from 'clsx'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { Challenge } from '../content/schema.ts'
import { InlineMarkdown } from '../components/Markdown.tsx'
import { Button } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { progressActions, useProgress } from '../progress/progress.ts'
import { gradeQuiz, type QuizAnswers } from '../runners/quiz.ts'

/** Multiple-choice questions for quiz and code-reading challenges. */
export function QuizPanel({ challenge }: { challenge: Challenge }) {
  const { t } = useI18n()
  const passed = useProgress().challenges[challenge.id]?.status === 'passed'
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [graded, setGraded] = useState<boolean[] | null>(null)
  // Questions whose answer changed since the last check: their verdict (and hint) keep their place but are hidden,
  // so nothing below jumps while the learner changes an answer.
  const [changed, setChanged] = useState<ReadonlySet<number>>(new Set())

  const toggle = (question: number, option: number, multiple: boolean) => {
    setChanged((current) => new Set(current).add(question))
    setAnswers((current) => {
      const selected = current[question] ?? []
      if (!multiple) return { ...current, [question]: [option] }
      return {
        ...current,
        [question]: selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option],
      }
    })
  }

  const check = () => {
    const result = gradeQuiz(challenge.questions, answers)
    setGraded(result)
    setChanged(new Set())
    if (result.every(Boolean)) progressActions.markPassed(challenge.id)
  }

  const allAnswered = challenge.questions.every((_, index) => (answers[index] ?? []).length > 0)
  const allCorrect = graded?.every(Boolean) && changed.size === 0

  return (
    <section className="space-y-5">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{t('challenge.questions')}</h2>
      <ol className="space-y-5">
        {challenge.questions.map((question, qIndex) => {
          const multiple = question.options.filter((o) => o.correct).length > 1
          const verdict = graded?.[qIndex]
          const stale = changed.has(qIndex)
          return (
            <li key={qIndex} className="rounded-xl border border-border bg-surface p-4">
              <fieldset>
                <legend className="font-medium">
                  <span className="mr-2 text-accent tabular-nums">{qIndex + 1}.</span>
                  <InlineMarkdown source={question.prompt} />
                </legend>
                {multiple && <p className="mt-1 text-xs text-muted">{t('challenge.multiple')}</p>}
                <div className="mt-3 space-y-2">
                  {question.options.map((option, oIndex) => {
                    const checked = (answers[qIndex] ?? []).includes(oIndex)
                    return (
                      <label
                        key={oIndex}
                        className={clsx(
                          'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                          checked ? 'border-accent bg-accent/8' : 'border-border hover:bg-surface-2',
                        )}
                      >
                        <input
                          type={multiple ? 'checkbox' : 'radio'}
                          name={`${challenge.id}-q${qIndex}`}
                          checked={checked}
                          onChange={() => toggle(qIndex, oIndex, multiple)}
                          className="size-4 accent-[var(--accent)]"
                        />
                        <InlineMarkdown source={option.text} />
                      </label>
                    )
                  })}
                </div>
                {verdict !== undefined && (
                  <p
                    aria-hidden={stale}
                    className={clsx(
                      'mt-3 flex items-center gap-1.5 text-sm font-medium',
                      verdict ? 'text-success' : 'text-danger',
                      stale && 'invisible',
                    )}
                  >
                    {verdict ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
                    {verdict ? t('challenge.quizCorrect') : t('challenge.quizWrong')}
                  </p>
                )}
                {verdict === false && question.hint && (
                  <p aria-hidden={stale} className={clsx('mt-1.5 text-sm text-muted', stale && 'invisible')}>
                    <InlineMarkdown source={question.hint} />
                  </p>
                )}
              </fieldset>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={check} disabled={!allAnswered}>
          {t('challenge.check')}
        </Button>
        {(allCorrect || (passed && !graded)) && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 size={16} aria-hidden />
            {allCorrect ? t('challenge.quizAll') : t('challenge.done')}
          </p>
        )}
      </div>
    </section>
  )
}
