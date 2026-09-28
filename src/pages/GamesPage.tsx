import { ArrowRight, CheckCircle2, Gamepad2 } from 'lucide-react'
import { Link } from 'react-router'
import { Badge, Page, ProgressBar } from '../components/ui.tsx'
import { games, passedSteps, resumeStep } from '../games/catalog.ts'
import { difficulties } from '../games/schema.ts'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle } from '../lib/hooks.ts'
import { useProgress } from '../progress/progress.ts'

export function GamesPage() {
  const { t, l } = useI18n()
  const progress = useProgress()
  useDocumentTitle(t('games.title'))

  return (
    <Page>
      <header className="max-w-2xl">
        <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent">
          <Gamepad2 size={24} aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{t('games.title')}</h1>
        <p className="mt-2 text-muted">{t('games.subtitle')}</p>
      </header>

      {difficulties.map((difficulty) => {
        const group = games.filter((game) => game.difficulty === difficulty)
        if (group.length === 0) return null
        return (
          <section key={difficulty} className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">
              {t(`games.difficulty.${difficulty}`)}
              <span className="ml-2 text-sm font-normal text-muted tabular-nums">{group.length}</span>
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((game) => {
                const done = passedSteps(progress, game)
                const total = game.steps.length
                const finished = done === total
                const step = resumeStep(progress, game)
                return (
                  <li key={game.id}>
                    <Link
                      to={`/games/${game.id}/${game.steps[step].id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
                    >
                      <GameArt color={game.color} title={l(game.title)} />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{t('games.steps', { count: total })}</Badge>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-accent">
                          {l(game.title)}
                        </h3>
                        <p className="mt-1 flex-1 text-sm text-muted">{l(game.description)}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <ProgressBar value={done} max={total} label={l(game.title)} />
                          <span className="shrink-0 text-xs text-muted tabular-nums">
                            {done}/{total}
                          </span>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                          {finished ? (
                            <>
                              <CheckCircle2 size={16} aria-hidden />
                              {t('games.done')}
                            </>
                          ) : (
                            <>
                              {done === 0 ? t('games.start') : t('games.continue')}
                              <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                                aria-hidden
                              />
                            </>
                          )}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      <p className="mt-10 rounded-xl border border-dashed border-border p-5 text-sm text-muted">{t('games.soon')}</p>
    </Page>
  )
}

/** A small decorative banner in the game's color; games have no screenshots, so this keeps cards distinct. */
function GameArt({ color, title }: { color: string; title: string }) {
  return (
    <div
      aria-hidden
      className="relative h-28 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}33, ${color}0d)` }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(${color}40 1px, transparent 1px), linear-gradient(90deg, ${color}40 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <span className="absolute right-5 bottom-3 left-5 line-clamp-2 text-3xl leading-[1.05] font-black tracking-tight text-balance opacity-90" style={{ color }}>
        {title}
      </span>
    </div>
  )
}
