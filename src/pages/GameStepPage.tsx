import clsx from 'clsx'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Eye,
  Loader2,
  MousePointerClick,
  Play,
  RotateCcw,
  Trophy,
  TriangleAlert,
  XCircle,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { ResizeHandle } from '../challenge/CodeWorkspace.tsx'
import { ConfirmButton } from '../components/ConfirmButton.tsx'
import { InlineMarkdown, Markdown } from '../components/Markdown.tsx'
import { Button, IconButton } from '../components/ui.tsx'
import { findGame, initialCode, resumeStep, stepPassed } from '../games/catalog.ts'
import { buildPlayDocument } from '../games/play-document.ts'
import { referenceStart, stepKey, type Game, type GameStep } from '../games/schema.ts'
import { useI18n } from '../i18n/i18n.ts'
import { useDebouncedEffect, useDocumentTitle, useMediaQuery } from '../lib/hooks.ts'
import { progressActions, useProgress } from '../progress/progress.ts'
import { allPassed, type RunResult } from '../runners/types.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

const CodeEditor = lazy(() => import('../editor/CodeEditor.tsx'))

type MobileTab = 'task' | 'code' | 'game'

export function GameStepPage() {
  const { gameId = '', stepId } = useParams()
  const { t, l } = useI18n()
  const progress = useProgress()
  const game = findGame(gameId)
  const index = game ? game.steps.findIndex((s) => s.id === stepId) : -1
  useDocumentTitle(game ? l(game.title) : t('game.notFound'))
  if (!game) return <NotFoundPage title={t('game.notFound')} />
  if (index === -1) return <Navigate to={`/games/${game.id}/${game.steps[resumeStep(progress, game)].id}`} replace />
  return <StepWorkspace key={`${game.id}/${stepId}`} game={game} index={index} />
}

function StepHeader({ game, index }: { game: Game; index: number }) {
  const { t, l } = useI18n()
  const navigate = useNavigate()
  const progress = useProgress()
  const go = (i: number) => navigate(`/games/${game.id}/${game.steps[i].id}`)
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-4">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link to="/games" aria-label={t('game.allGames')} className="flex shrink-0 items-center gap-1 text-muted hover:text-fg">
          <ArrowLeft size={15} aria-hidden />
          <span className="hidden sm:inline">{t('game.allGames')}</span>
        </Link>
        <ChevronRight size={14} className="hidden shrink-0 text-muted sm:block" aria-hidden />
        <span className="truncate font-medium" aria-current="page">
          {l(game.title)}
        </span>
      </nav>
      <ol className="mx-auto hidden items-center gap-1 md:flex" aria-label={t('game.step', { n: index + 1, total: game.steps.length })}>
        {game.steps.map((step, i) => (
          <li key={step.id}>
            <Link
              to={`/games/${game.id}/${step.id}`}
              aria-label={t('game.stepLabel', { n: i + 1, title: l(step.title) })}
              aria-current={i === index ? 'step' : undefined}
              title={l(step.title)}
              className={clsx(
                'block h-2 rounded-full transition-all',
                i === index ? 'w-6 bg-accent' : 'w-2',
                i !== index && (stepPassed(progress, game, i) ? 'bg-success' : 'bg-border hover:bg-muted'),
              )}
            />
          </li>
        ))}
      </ol>
      <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
        <IconButton label={t('game.previousStep')} disabled={index === 0} onClick={() => go(index - 1)}>
          <ChevronLeft size={18} />
        </IconButton>
        <span className="text-xs text-muted tabular-nums">
          {index + 1}/{game.steps.length}
        </span>
        <IconButton label={t('game.nextStep')} disabled={index === game.steps.length - 1} onClick={() => go(index + 1)}>
          <ChevronRight size={18} />
        </IconButton>
      </div>
    </div>
  )
}

function StepChecks({ step, result }: { step: GameStep; result: RunResult | null }) {
  const { t, l } = useI18n()
  return (
    <ul className="space-y-2">
      {step.tests.map((test, i) => {
        const outcome = result?.tests[i]
        return (
          <li
            key={i}
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
              <InlineMarkdown source={l(test.text)} />
              {outcome?.error && (
                <pre className="mt-1.5 overflow-x-auto font-mono text-xs whitespace-pre-wrap text-danger">{outcome.error}</pre>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ResultSummary({ step, result }: { step: GameStep; result: RunResult | null }) {
  const { t } = useI18n()
  if (!result) return <p className="text-sm text-muted">{t('game.notRun')}</p>
  if (allPassed(result)) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-success">
        <CheckCircle2 size={18} aria-hidden />
        {t('game.passed')}
      </p>
    )
  }
  const failed = result.tests.filter((test) => !test.passed).length
  return (
    <div role="status" className="space-y-2">
      <p className="text-sm font-medium text-danger">{t('game.failed', { failed, total: step.tests.length })}</p>
      {result.error && (
        <pre className="overflow-x-auto rounded-lg border border-danger/30 bg-danger/8 p-3 font-mono text-xs whitespace-pre-wrap text-danger">
          {result.error}
        </pre>
      )}
    </div>
  )
}

/** Shown once the step passes: a link to the next step, or the finish card on the last one. */
function StepDone({ game, index }: { game: Game; index: number }) {
  const { t, l } = useI18n()
  const progress = useProgress()
  if (!stepPassed(progress, game, index)) return null
  const next = game.steps[index + 1]
  if (next) {
    return (
      <Link
        to={`/games/${game.id}/${next.id}`}
        className="group flex items-center gap-3 rounded-xl border border-success/40 bg-success/8 p-4 transition-colors hover:border-success"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-success">{t('game.nextStep')}</span>
          <span className="block truncate font-medium">{l(next.title)}</span>
        </span>
        <ArrowRight size={18} className="text-success transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    )
  }
  return (
    <section className="rounded-xl border border-success/40 bg-success/8 p-4">
      <h2 className="flex items-center gap-2 font-semibold text-success">
        <Trophy size={18} aria-hidden />
        {t('game.finished', { game: l(game.title) })}
      </h2>
      {game.extend.length > 0 && (
        <>
          <p className="mt-2 text-sm">{t('game.finishedHint')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {game.extend.map((idea, i) => (
              <li key={i}>
                <InlineMarkdown source={l(idea)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function StepText({ game, index }: { game: Game; index: number }) {
  const { t, l } = useI18n()
  const step = game.steps[index]
  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">
          {t('game.step', { n: index + 1, total: game.steps.length })}
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-balance">{l(step.title)}</h1>
      </div>
      <section>
        <h2 className="sr-only">{t('game.idea')}</h2>
        <Markdown source={l(step.explanation)} />
      </section>
      <section className="rounded-xl border border-accent/25 bg-accent/5 p-4">
        <h2 className="text-xs font-semibold tracking-wide text-accent uppercase">{t('game.task')}</h2>
        <Markdown source={l(step.task)} className="mt-2" />
      </section>
      <StepDone game={game} index={index} />
    </div>
  )
}

/** The live game. Reloads whenever `doc` changes; reports errors and whether it has keyboard focus. */
function GameFrame({
  doc,
  title,
  focusOnLoad,
  onError,
  onRun,
}: {
  doc: string
  title: string
  /** Focus the game after it loads (after Run/Restart, not when the page first opens). */
  focusOnLoad: boolean
  onError: (message: string) => void
  onRun: () => void
}) {
  const { t } = useI18n()
  const frame = useRef<HTMLIFrameElement>(null)
  const [focused, setFocused] = useState(false)
  const handlers = useRef({ onError, onRun })
  useEffect(() => {
    handlers.current = { onError, onRun }
  })

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return
      const data = event.data as { __lpGame?: string; text?: string }
      if (data?.__lpGame === 'focus') setFocused(true)
      if (data?.__lpGame === 'blur') setFocused(false)
      if (data?.__lpGame === 'error') handlers.current.onError(String(data.text))
      if (data?.__lpGame === 'run') handlers.current.onRun()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const focusGame = () => {
    const win = frame.current?.contentWindow
    win?.focus()
    ;(win?.document.querySelector('canvas') as HTMLCanvasElement | null)?.focus()
  }

  return (
    <div className="relative min-h-0 flex-1 bg-[#2b303b]">
      <iframe
        ref={frame}
        title={title}
        srcDoc={doc}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => {
          if (focusOnLoad) focusGame()
        }}
        className="absolute inset-0 size-full border-0"
      />
      {!focused && (
        <button
          type="button"
          onClick={focusGame}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur hover:bg-black/85"
        >
          <MousePointerClick size={14} aria-hidden />
          {t('game.clickToPlay')}
        </button>
      )}
    </div>
  )
}

function HResizeHandle() {
  return (
    <Separator className="group relative h-px shrink-0 bg-border outline-none data-[separator=active]:bg-accent">
      <span className="absolute inset-x-0 -top-1.5 -bottom-1.5 group-hover:bg-accent/20 group-focus-visible:bg-accent/30" />
    </Separator>
  )
}

function StepWorkspace({ game, index }: { game: Game; index: number }) {
  const { t, l } = useI18n()
  const progress = useProgress()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const step = game.steps[index]
  const key = stepKey(game.id, step.id)
  const [code, setCode] = useState(() => initialCode(progress, game, index))
  const [doc, setDoc] = useState(() => buildPlayDocument(code, game.canvas))
  const [result, setResult] = useState<RunResult | null>(null)
  const [crash, setCrash] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [focusOnLoad, setFocusOnLoad] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('task')
  const dirty = useRef(false)

  useDebouncedEffect(
    code,
    400,
    (value) => {
      if (dirty.current) progressActions.saveFiles(key, [{ name: 'game.js', lang: 'js', contents: value }])
    },
    { flushOnLeave: true },
  )

  const restart = useCallback(() => {
    setCrash(null)
    setFocusOnLoad(true)
    // A new document string reloads the frame even when the code did not change.
    setDoc(`${buildPlayDocument(code, game.canvas)}<!-- ${Date.now()} -->`)
  }, [code, game.canvas])

  const run = useCallback(async () => {
    if (running) return
    setRunning(true)
    restart()
    setMobileTab('game')
    try {
      const { runGameInWorker } = await import('../games/browser.ts')
      const next = await runGameInWorker({
        code,
        canvas: game.canvas,
        tests: step.tests.map((test) => ({ text: l(test.text), code: test.code })),
      })
      setResult(next)
      if (allPassed(next)) {
        progressActions.saveFiles(key, [{ name: 'game.js', lang: 'js', contents: code }])
        progressActions.markPassed(key)
      }
    } finally {
      setRunning(false)
    }
  }, [code, game.canvas, key, l, restart, running, step.tests])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        void run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [run])

  const replaceCode = (next: string) => {
    dirty.current = true
    setCode(next)
    setResult(null)
  }

  const runButton = (
    <Button variant="primary" size="sm" onClick={() => void run()} disabled={running} title="Ctrl + Enter">
      {running ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Play size={15} aria-hidden />}
      {running ? t('game.running') : t('game.run')}
      <kbd className="hidden rounded bg-black/15 px-1.5 py-0.5 font-sans text-[10px] xl:inline">Ctrl ↵</kbd>
    </Button>
  )

  const editor = (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-muted">game.js</span>
        <ConfirmButton
          label={t('game.solution')}
          confirmLabel={t('game.solutionConfirm')}
          onConfirm={() => replaceCode(step.solution)}
        >
          <Eye size={15} aria-hidden />
          <span className="hidden xl:inline">{t('game.solution')}</span>
        </ConfirmButton>
        <ConfirmButton
          label={t('game.resetStep')}
          confirmLabel={t('game.resetConfirm')}
          onConfirm={() => replaceCode(referenceStart(game, index))}
        >
          <RotateCcw size={15} aria-hidden />
          <span className="hidden xl:inline">{t('game.resetStep')}</span>
        </ConfirmButton>
        {isDesktop && runButton}
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-4 text-sm text-muted">…</div>}>
          <CodeEditor
            path={`games/${game.id}/game.js`}
            lang="js"
            value={code}
            onChange={(value) => {
              dirty.current = true
              setCode(value)
            }}
            onRun={() => void run()}
            label={t('game.editorLabel', { game: l(game.title) })}
          />
        </Suspense>
      </div>
    </div>
  )

  const gameView = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-1.5">
        <span className="flex-1 text-xs font-semibold tracking-wide text-muted uppercase">{t('game.preview')}</span>
        <IconButton label={t('game.restart')} onClick={restart}>
          <RotateCcw size={16} />
        </IconButton>
      </div>
      <GameFrame doc={doc} title={t('game.preview')} focusOnLoad={focusOnLoad} onError={setCrash} onRun={() => void run()} />
      {crash && (
        <div role="alert" className="flex shrink-0 gap-2 border-t border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          <TriangleAlert size={15} className="mt-px shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="font-semibold">{t('game.crashed')}: </span>
            <span className="font-mono break-words">{crash}</span>
          </span>
        </div>
      )}
    </div>
  )

  const checks = (
    <section className="h-full space-y-3 overflow-y-auto bg-surface p-4">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{t('game.checks')}</h2>
      <ResultSummary step={step} result={result} />
      {result && allPassed(result) && <StepDone game={game} index={index} />}
      <StepChecks step={step} result={result} />
      {result && result.logs.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted">{t('game.console')}</summary>
          <pre className="mt-2 font-mono whitespace-pre-wrap">{result.logs.join('\n')}</pre>
        </details>
      )}
    </section>
  )

  let body
  if (isDesktop) {
    body = (
      <Group orientation="horizontal" className="h-full">
        <Panel defaultSize="50%" minSize="30%">
          <Group orientation="vertical" className="h-full">
            <Panel defaultSize="45%" minSize="15%">
              <div className="h-full overflow-y-auto">
                <StepText game={game} index={index} />
              </div>
            </Panel>
            <HResizeHandle />
            <Panel defaultSize="55%" minSize="20%">
              {editor}
            </Panel>
          </Group>
        </Panel>
        <ResizeHandle />
        <Panel defaultSize="50%" minSize="25%">
          <Group orientation="vertical" className="h-full">
            <Panel defaultSize="62%" minSize="25%">
              {gameView}
            </Panel>
            <HResizeHandle />
            <Panel defaultSize="38%" minSize="12%">
              {checks}
            </Panel>
          </Group>
        </Panel>
      </Group>
    )
  } else {
    const tabs: { id: MobileTab; label: string }[] = [
      { id: 'task', label: t('game.tabTask') },
      { id: 'code', label: t('game.tabCode') },
      { id: 'game', label: t('game.tabGame') },
    ]
    body = (
      <div className="flex h-full flex-col">
        <div role="tablist" aria-label={l(step.title)} className="flex shrink-0 gap-1 border-b border-border px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mobileTab === tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={clsx(
                '-mb-px border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition-colors',
                mobileTab === tab.id ? 'border-accent font-medium text-fg' : 'border-transparent text-muted hover:text-fg',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          <div className={clsx('h-full overflow-y-auto', mobileTab !== 'task' && 'hidden')}>
            <StepText game={game} index={index} />
          </div>
          <div className={clsx('h-full', mobileTab !== 'code' && 'hidden')}>{editor}</div>
          <div className={clsx('flex h-full flex-col', mobileTab !== 'game' && 'hidden')}>
            <div className="min-h-0 flex-[3]">{gameView}</div>
            <div className="min-h-0 flex-[2] border-t border-border">{checks}</div>
          </div>
        </div>
        <div className="shrink-0 border-t border-border bg-surface p-3">{runButton}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <StepHeader game={game} index={index} />
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  )
}
