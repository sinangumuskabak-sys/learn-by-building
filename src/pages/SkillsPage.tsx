import clsx from 'clsx'
import { Link } from 'react-router'
import { catalog } from '../content/catalog.ts'
import { MAX_LEVEL } from '../content/schema.ts'
import { CategoryIcon } from '../components/icons.tsx'
import { Page } from '../components/ui.tsx'
import { gameSkillEvidence } from '../games/catalog.ts'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle } from '../lib/hooks.ts'
import { useProgress } from '../progress/progress.ts'
import { skillLevel } from '../progress/skills.ts'

const levels = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => level)

export function SkillsPage() {
  const { t, l, ct } = useI18n()
  const progress = useProgress()
  useDocumentTitle(t('skills.title'))

  const groups = catalog.curriculum.categories
    .map((category) => ({ category, skills: catalog.skills.filter((s) => s.category === category.id) }))
    .filter((group) => group.skills.length > 0)

  return (
    <Page className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('skills.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('skills.subtitle')}</p>

      <ol className="mt-6 grid grid-cols-3 gap-2 text-xs sm:grid-cols-9" aria-label="Levels">
        {levels.map((level) => (
          <li key={level} className="rounded-lg border border-border bg-surface px-2 py-1.5 text-center">
            <span className="block font-semibold text-accent tabular-nums">L{level}</span>
            <span className="block truncate text-muted">{t(`level.${level}` as `level.0`)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-8">
        {groups.map(({ category, skills }) => (
          <section key={category.id}>
            <h2 className="flex items-center gap-2 font-semibold tracking-tight">
              <CategoryIcon name={category.icon} size={18} className="text-accent" />
              {l(category.title)}
            </h2>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {skills.map((skill) => {
                const fromChallenges = skillLevel(progress, skill.id)
                const fromGames = gameSkillEvidence(progress, skill.id)
                const level = Math.max(fromChallenges.level, fromGames.level)
                const evidence = fromChallenges.evidence
                return (
                  <li key={skill.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="min-w-40 flex-1">
                        <p className="font-medium">{l(skill.title)}</p>
                        <p className="font-mono text-xs text-muted">{skill.id}</p>
                      </div>
                      <div
                        className="flex gap-1"
                        role="img"
                        aria-label={level < 0 ? t('skills.noEvidence') : t('level.label', { level })}
                      >
                        {levels.map((step) => (
                          <span
                            key={step}
                            className={clsx('h-2 w-4 rounded-full sm:w-6', step <= level ? 'bg-accent' : 'bg-surface-2')}
                          />
                        ))}
                      </div>
                      <span className="w-10 text-right text-sm font-semibold tabular-nums">
                        {level < 0 ? '—' : `L${level}`}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-muted">{t('skills.evidence')}:</span>
                      {evidence.length === 0 && fromGames.steps.length === 0 ? (
                        <span className="text-muted">{t('skills.noEvidence')}</span>
                      ) : (
                        <>
                          {evidence.map((challenge) => (
                            <Link
                              key={challenge.id}
                              to={`/learn/${challenge.id}`}
                              className="rounded-md bg-success/10 px-2 py-0.5 text-success hover:underline"
                            >
                              {ct(challenge)}
                            </Link>
                          ))}
                          {fromGames.steps.map(({ game, step, index }) => (
                            <Link
                              key={`${game.id}/${step.id}`}
                              to={`/games/${game.id}/${step.id}`}
                              className="rounded-md bg-success/10 px-2 py-0.5 text-success hover:underline"
                            >
                              {l(game.title)} · {t('game.step', { n: index + 1, total: game.steps.length })}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  )
}
