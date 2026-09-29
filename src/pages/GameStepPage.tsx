import clsx from 'clsx'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Eye,
  Lightbulb,
  Loader2,
  Lock,
  LockOpen,
  MousePointerClick,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { ConfirmButton } from '../components/ConfirmButton.tsx'
import { InlineMarkdown, Markdown } from '../components/Markdown.tsx'
import { Button, IconButton } from '../components/ui.tsx'
import { findGame, initialCode, loadGame, resumeStep, stepPassed } from '../games/catalog.ts'
import { gameStorageSnapshot, saveGameStorage } from '../games/frame-storage.ts'
import { lockedLines, withEditableLine } from '../games/lock.ts'
import { buildPlayDocument } from '../games/play-document.ts'
import {
  parsePredict,
  projectFile,
  referenceStart,
  stepKey,
  type Game,
  type GameStep,
  type GameSummary,
} from '../games/schema.ts'
import { useI18n } from '../i18n/i18n.ts'
import { useDebouncedEffect, useDocumentTitle, useMediaQuery } from '../lib/hooks.ts'
import { formatChecks, useMaymunContext } from '../maymun/context.ts'
import { framePointer } from '../maymun/tracker.ts'
import { progressActions, useProgress } from '../progress/progress.ts'
import { allPassed, type RunResult } from '../runners/types.ts'
import { previewDocument } from '../runners/web-document.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

const CodeEditor = lazy(() => import('../editor/CodeEditor.tsx'))

type MobileTab = 'task' | 'code' | 'game'

/** A game's full steps (texts, tests, solutions) load on demand; the games list only ships summaries. */
function useFullGame(id: string): Game | undefined {
  const [game, setGame] = useState<Game>()
  useEffect(() => {
    let active = true
    void loadGame(id).then((loaded) => {
      if (active) setGame(loaded)
    })
    return () => {
      active = false
    }
  }, [id])
  return game?.id === id ? game : undefined
}

export function GameStepPage() {
  const { gameId = '', stepId } = useParams()
  const { t, l } = useI18n()
  const progress = useProgress()
  const summary = findGame(gameId)
  const game = useFullGame(gameId)
  const index = summary ? summary.steps.findIndex((s) => s.id === stepId) : -1
  useDocumentTitle(summary ? l(summary.title) : t('game.notFound'))
  if (!summary) return <NotFoundPage title={t('game.notFound')} />
  if (index === -1) return <Navigate to={`/games/${summary.id}/${summary.steps[resumeStep(progress, summary)].id}`} replace />
  if (!game) {
    return (
      <div className="flex h-full flex-col">
        <StepHeader game={summary} index={index} />
        <p className="p-6 text-sm text-muted">…</p>
      </div>
    )
  }
  return <StepWorkspace key={`${game.id}/${stepId}`} game={game} index={index} />
}

function StepHeader({ game, index }: { game: GameSummary; index: number }) {
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

function ResultSummary({ game, step, result }: { game: Game; step: GameStep; result: RunResult | null }) {
  const { t, l } = useI18n()
  if (!result) return <p className="text-sm text-muted">{t(game.kind === 'web' ? 'web.notRun' : 'game.notRun')}</p>
  if (allPassed(result)) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-success">
        <CheckCircle2 size={18} aria-hidden />
        {t('game.passed')}
      </p>
    )
  }
  const failed = result.tests.filter((test) => !test.passed).length
  const first = step.tests.find((_, i) => !result.tests[i]?.passed)
  return (
    <div role="status" className="space-y-2">
      <p className="text-sm font-medium text-danger">{t('game.failed', { failed, total: step.tests.length })}</p>
      {result.error && (
        <pre className="overflow-x-auto rounded-lg border border-danger/30 bg-danger/8 p-3 font-mono text-xs whitespace-pre-wrap text-danger">
          {result.error}
        </pre>
      )}
      {(first || step.hint) && (
        <div data-testid="hint-box" className="flex gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm">
          <Lightbulb size={17} className="mt-0.5 shrink-0 text-amber-500" aria-hidden />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-semibold">{t('game.hint')}</p>
            {step.hint ? <Markdown source={l(step.hint)} /> : first && <InlineMarkdown source={l(first.text)} />}
          </div>
        </div>
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
  const tryIt = game.steps[index].try
  const tryBox = tryIt && (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-accent uppercase">
        <Sparkles size={15} aria-hidden />
        {t('game.try')}
      </h2>
      <Markdown source={l(tryIt)} className="mt-2" />
    </section>
  )
  if (next) {
    return (
      <>
      {tryBox}
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
      </>
    )
  }
  const web = game.kind === 'web'
  return (
    <>
    {tryBox}
    <section className="rounded-xl border border-success/40 bg-success/8 p-4">
      <h2 className="flex items-center gap-2 font-semibold text-success">
        <Trophy size={18} aria-hidden />
        {t(web ? 'web.finished' : 'game.finished', { game: l(game.title) })}
      </h2>
      {game.extend.length > 0 && (
        <>
          <p className="mt-2 text-sm">{t(web ? 'web.finishedHint' : 'game.finishedHint')}</p>
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
    </>
  )
}

/** The finished project, playable in a window: what the steps are building towards. */
function FinishedPreview({ game }: { game: Game }) {
  const { t, l } = useI18n()
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const last = game.steps[game.steps.length - 1].solution
  const doc =
    game.kind === 'web' ? previewDocument([{ ...projectFile('web'), contents: last }]) : buildPlayDocument(last, game.canvas)
  const title = t('game.finishedPreviewTitle', { game: l(game.title) })
  return (
    <>
      <Button
        size="sm"
        onClick={() => {
          setOpen(true)
          dialog.current?.showModal()
        }}
      >
        <Sparkles size={15} aria-hidden />
        {t('game.finishedPreview')}
      </Button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-label={title}
        className="m-auto w-[min(92vw,760px)] overflow-hidden rounded-xl border border-border bg-bg p-0 text-fg shadow-2xl backdrop:bg-black/60"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
          <IconButton label={t('game.close')} onClick={() => dialog.current?.close()}>
            <X size={16} />
          </IconButton>
        </div>
        {open && (
          <iframe
            title={title}
            srcDoc={doc}
            sandbox="allow-scripts"
            onLoad={(event) => {
              const win = event.currentTarget.contentWindow
              win?.focus()
              win?.postMessage({ __lpGame: 'focus-canvas' }, '*')
            }}
            className={clsx('block h-[min(70vh,560px)] w-full border-0', game.kind === 'web' ? 'bg-white' : 'bg-[#2b303b]')}
          />
        )}
      </dialog>
    </>
  )
}

/** A guess before running: pick an option, then see whether it was right and why. */
function Predict({ source }: { source: string }) {
  const { t } = useI18n()
  const { question, options } = useMemo(() => parsePredict(source), [source])
  const [picked, setPicked] = useState<number | null>(null)
  const choice = picked === null ? null : options[picked]
  return (
    <div data-testid="predict" className="mb-3 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t('game.predict')}</p>
      <Markdown source={question} className="mt-1.5" />
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPicked(i)}
            aria-pressed={picked === i}
            className={clsx(
              'rounded-lg border px-3 py-1.5 text-left text-sm transition-colors',
              picked === null && 'border-border hover:border-accent',
              picked !== null && option.correct && 'border-success bg-success/10',
              picked === i && !option.correct && 'border-danger bg-danger/10',
              picked !== null && picked !== i && !option.correct && 'border-border opacity-60',
            )}
          >
            <InlineMarkdown source={option.text} />
          </button>
        ))}
      </div>
      {choice && (
        <p role="status" className={clsx('mt-2 text-sm', choice.correct ? 'text-success' : 'text-danger')}>
          <span className="font-semibold">{t(choice.correct ? 'game.predictRight' : 'game.predictWrong')}</span>{' '}
          {choice.why && <InlineMarkdown source={choice.why} />} <span className="text-fg">{t('game.predictRun')}</span>
        </p>
      )}
    </div>
  )
}

/** How far the learner has opened each step's four parts, kept while they move between steps. */
const openedParts = new Map<string, number>()

function StepText({ game, index }: { game: Game; index: number }) {
  const { t, l } = useI18n()
  const progress = useProgress()
  const step = game.steps[index]
  const key = stepKey(game.id, step.id)
  const [shown, setShown] = useState(() => (stepPassed(progress, game, index) ? 4 : (openedParts.get(key) ?? 1)))
  const header = (
    <div className="flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">
          {t('game.step', { n: index + 1, total: game.steps.length })}
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-balance">{l(step.title)}</h1>
      </div>
      <FinishedPreview game={game} />
    </div>
  )
  if (!step.goal) {
    return (
      <div className="space-y-5 p-5 sm:p-6">
        {header}
        {step.explanation && (
          <section>
            <h2 className="sr-only">{t('game.idea')}</h2>
            <Markdown source={l(step.explanation)} />
          </section>
        )}
        <section className="rounded-xl border border-accent/25 bg-accent/5 p-4">
          <h2 className="text-xs font-semibold tracking-wide text-accent uppercase">{t('game.task')}</h2>
          <Markdown source={l(step.task)} className="mt-2" />
        </section>
        <StepDone game={game} index={index} />
      </div>
    )
  }
  // A step without code to copy is the "build it yourself" one: only what to build, then the learner's turn.
  const own = !step.code || !step.meaning
  const parts: { title: string; body: ReactNode }[] = [
    { title: t(own ? 'game.part.own' : 'game.part.goal'), body: <Markdown source={l(step.goal)} /> },
    ...(own
      ? []
      : [
          { title: t('game.part.code'), body: <Markdown source={step.code ?? ''} /> },
          { title: t('game.part.meaning'), body: <Markdown source={l(step.meaning!)} /> },
        ]),
    {
      title: t('game.part.task'),
      body: (
        <>
          {own && <p className="mb-2 text-sm text-muted">{t('game.part.ownHint')}</p>}
          {step.predict && <Predict source={l(step.predict)} />}
          <Markdown source={l(step.task)} />
        </>
      ),
    },
  ]
  return (
    <div className="space-y-4 p-5 sm:p-6">
      {header}
      <ol className="space-y-3">
        {parts.slice(0, shown).map((part, i) => (
          <li
            key={i}
            data-testid={`step-part-${i + 1}`}
            className={clsx('rounded-xl border p-4', i === parts.length - 1 ? 'border-accent/30 bg-accent/5' : 'border-border bg-surface')}
          >
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-accent uppercase">
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-accent-fg" aria-hidden>
                {i + 1}
              </span>
              {part.title}
            </h2>
            <div className="mt-2">{part.body}</div>
            {i === shown - 1 && i < parts.length - 1 && (
              <Button
                size="sm"
                variant="primary"
                className="mt-3"
                onClick={() => {
                  openedParts.set(key, i + 2)
                  setShown(i + 2)
                }}
              >
                {t('game.part.continue')}
                <ArrowRight size={15} aria-hidden />
              </Button>
            )}
          </li>
        ))}
      </ol>
      <StepDone game={game} index={index} />
    </div>
  )
}

/** The live game. Reloads whenever `doc` changes; reports errors and whether it has keyboard focus. */
function GameFrame({
  doc,
  title,
  web,
  frameRef,
  focusOnLoad,
  onError,
  onRun,
}: {
  doc: string
  title: string
  /** A web page: no canvas to focus, shown on white. */
  web: boolean
  frameRef: RefObject<HTMLIFrameElement | null>
  /** Focus the game after it loads (after Run/Restart, not when the page first opens). */
  focusOnLoad: boolean
  onError: (message: string) => void
  onRun: () => void
}) {
  const { t } = useI18n()
  const frame = frameRef
  const [focused, setFocused] = useState(false)
  const handlers = useRef({ onError, onRun })
  useEffect(() => {
    handlers.current = { onError, onRun }
  })

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return
      const data = event.data as { __lpGame?: string; text?: string; x?: number; y?: number; down?: boolean; key?: unknown; value?: unknown }
      if (data?.__lpGame === 'pointer' && frame.current) framePointer(frame.current, Number(data.x), Number(data.y))
      if (data?.__lpGame === 'storage') saveGameStorage(data.key, data.value)
      if (data?.__lpGame === 'focus') setFocused(true)
      if (data?.__lpGame === 'blur') setFocused(false)
      if (data?.__lpGame === 'error') handlers.current.onError(String(data.text))
      if (data?.__lpGame === 'run') handlers.current.onRun()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [frame])

  // The frame is not on the site's origin: it is asked to focus its canvas.
  const focusGame = () => {
    const win = frame.current?.contentWindow
    win?.focus()
    win?.postMessage({ __lpGame: 'focus-canvas' }, '*')
  }

  return (
    <div className={clsx('relative min-h-0 flex-1', web ? 'bg-white' : 'bg-[#2b303b]')}>
      <iframe
        ref={frame}
        title={title}
        srcDoc={doc}
        // No allow-same-origin: the learner's code must not reach the site's storage (progress, AI keys).
        sandbox="allow-scripts"
        data-snapshot=""
        onLoad={() => {
          if (focusOnLoad) focusGame()
        }}
        className="absolute inset-0 size-full border-0"
      />
      {!focused && !web && (
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

/**
 * The step text opens scrolled to its end, where the newest part (the task, then the link to the next step) is, and
 * stays there while it grows or is shown again, unless the learner scrolled up to read.
 */
function stickToBottom(el: HTMLDivElement | null) {
  if (!el) return
  let atEnd = true
  let placed = 0 // where toEnd last put the scroll position
  const toEnd = () => {
    if (!atEnd || el.clientHeight === 0) return
    el.scrollTop = el.scrollHeight
    placed = el.scrollTop
  }
  // Only scrolling up from where the text was placed counts as the learner leaving the end (growing text does not).
  const onScroll = () => {
    if (el.clientHeight > 0) atEnd = el.scrollTop >= placed - 2 || el.scrollHeight - el.scrollTop - el.clientHeight < 24
  }
  el.addEventListener('scroll', onScroll, { passive: true })
  const observer = new ResizeObserver(toEnd)
  observer.observe(el)
  if (el.firstElementChild) observer.observe(el.firstElementChild)
  toEnd()
  return () => {
    observer.disconnect()
    el.removeEventListener('scroll', onScroll)
  }
}

function ResizeHandle() {
  return (
    <Separator className="group relative w-px shrink-0 bg-border outline-none data-[separator=active]:bg-accent">
      <span className="absolute inset-y-0 -right-1.5 -left-1.5 group-hover:bg-accent/20 group-focus-visible:bg-accent/30" />
    </Separator>
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
  const web = game.kind === 'web'
  const file = projectFile(game.kind)
  const start = referenceStart(game, index)
  const [code, setCode] = useState(() => {
    const opened = initialCode(progress, game, index)
    return withEditableLine(opened, lockedLines(start, step.solution, opened))
  })
  const [lockOn, setLockOn] = useState(true)
  const lock = useMemo(() => {
    const lines = lockedLines(start, step.solution, code)
    if (!lines) return null
    // The editor counts the empty line after a final newline as a line of its own.
    return { before: lines.before, after: lines.after + (lines.after > 0 && code.endsWith('\n') ? 1 : 0) }
  }, [start, step.solution, code])
  const documentFor = useCallback(
    (source: string) =>
      web ? previewDocument([{ ...projectFile('web'), contents: source }]) : buildPlayDocument(source, game.canvas, gameStorageSnapshot()),
    [web, game.canvas],
  )
  const [doc, setDoc] = useState(() => documentFor(code))
  const frame = useRef<HTMLIFrameElement>(null)
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
      if (dirty.current) progressActions.saveFiles(key, [{ ...file, contents: value }])
    },
    { flushOnLeave: true },
  )
  // A web page updates as it is typed, like a live preview; not while the checks run in the same frame (the run shows
  // the page itself, and reloading the frame would stop the checks).
  const checking = useRef(false)
  useDebouncedEffect(code, 500, (value) => {
    if (web && dirty.current && !checking.current) setDoc(documentFor(value))
  })

  const restart = useCallback(() => {
    setCrash(null)
    setFocusOnLoad(true)
    // A new document string reloads the frame even when the code did not change.
    setDoc(`${documentFor(code)}<!-- ${Date.now()} -->`)
  }, [code, documentFor])

  const run = useCallback(async () => {
    if (running) return
    setRunning(true)
    setMobileTab('game')
    const tests = step.tests.map((test) => ({ text: l(test.text), code: test.code }))
    try {
      let next: RunResult
      if (web) {
        // The checks run inside the page's own frame, which then keeps showing the page.
        setCrash(null)
        checking.current = true
        const { runWebInIframe } = await import('../runners/browser.ts')
        next = frame.current
          ? await runWebInIframe(frame.current, { tests }, [{ ...file, contents: code }])
          : { tests: tests.map((test) => ({ text: test.text, passed: false })), logs: [], error: 'Preview is not available' }
      } else {
        restart()
        const { runGameInWorker } = await import('../games/browser.ts')
        next = await runGameInWorker({ code, canvas: game.canvas, tests })
      }
      setResult(next)
      if (allPassed(next)) {
        progressActions.saveFiles(key, [{ ...file, contents: code }])
        progressActions.markPassed(key)
      }
    } finally {
      checking.current = false
      setRunning(false)
    }
  }, [code, file, game.canvas, key, l, restart, running, step.tests, web])

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

  useMaymunContext('code', () => ({
    title: `${l(game.title)} — ${l(step.title)} — ${file.name}`,
    text: [
      step.code ? `Code to write in this step:\n${step.code}` : '',
      `Task:\n${l(step.task)}`,
      `Code (${file.name}):\n${code}`,
      result ? `Checks:\n${formatChecks(result)}` : 'Checks: not run yet.',
      crash ? `Game crashed: ${crash}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  }))
  useMaymunContext('game', () => ({
    title: `${l(game.title)} — ${l(step.title)}`,
    text: [
      crash ? `Game crashed: ${crash}` : web ? 'The page is shown.' : 'The game is running.',
      result && result.logs.length > 0 ? `Console:\n${result.logs.join('\n')}` : '',
      `Code (${file.name}):\n${code}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
  }))
  useMaymunContext('results', () => ({
    title: `${l(game.title)} — ${l(step.title)} — ${t('game.checks')}`,
    text: [result ? formatChecks(result) : 'Checks: not run yet.', `Code (${file.name}):\n${code}`].join('\n\n'),
  }))

  const editor = (
    <div data-maymun="code" className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-muted">{file.name}</span>
        {lock && (
          <IconButton
            label={lockOn ? t('game.unlock') : t('game.locked')}
            aria-pressed={lockOn}
            onClick={() => setLockOn(!lockOn)}
            className={lockOn ? 'text-accent' : undefined}
          >
            {lockOn ? <Lock size={15} /> : <LockOpen size={15} />}
          </IconButton>
        )}
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
          onConfirm={() => replaceCode(withEditableLine(start, lockedLines(start, step.solution, start)))}
        >
          <RotateCcw size={15} aria-hidden />
          <span className="hidden xl:inline">{t('game.resetStep')}</span>
        </ConfirmButton>
        {isDesktop && runButton}
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-4 text-sm text-muted">…</div>}>
          <CodeEditor
            path={`games/${game.id}/${file.name}`}
            lang={file.lang}
            value={code}
            onChange={(value) => {
              dirty.current = true
              setCode(value)
            }}
            onRun={() => void run()}
            label={t('game.editorLabel', { game: l(game.title), file: file.name })}
            locked={lockOn ? lock : null}
            lockedMessage={t('game.lockedMessage')}
            startAtEnd
          />
        </Suspense>
      </div>
    </div>
  )

  const gameView = (
    <div data-maymun="game" className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-1.5">
        <span className="flex-1 text-xs font-semibold tracking-wide text-muted uppercase">{t(web ? 'web.preview' : 'game.preview')}</span>
        <IconButton label={t(web ? 'web.restart' : 'game.restart')} onClick={restart}>
          <RotateCcw size={16} />
        </IconButton>
      </div>
      <GameFrame
        doc={doc}
        title={t(web ? 'web.preview' : 'game.preview')}
        web={web}
        frameRef={frame}
        focusOnLoad={focusOnLoad}
        onError={setCrash}
        onRun={() => void run()}
      />
      {crash && (
        <div role="alert" className="flex shrink-0 gap-2 border-t border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          <TriangleAlert size={15} className="mt-px shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="font-semibold">{t(web ? 'web.crashed' : 'game.crashed')}: </span>
            <span className="font-mono break-words">{crash}</span>
          </span>
        </div>
      )}
    </div>
  )

  const checks = (
    <section data-maymun="results" className="h-full space-y-3 overflow-y-auto bg-surface p-4">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{t('game.checks')}</h2>
      <ResultSummary game={game} step={step} result={result} />
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
              <div ref={stickToBottom} tabIndex={0} data-maymun="task" className="h-full overflow-y-auto">
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
      { id: 'game', label: t(web ? 'web.tabGame' : 'game.tabGame') },
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
          <div
            ref={stickToBottom}
            tabIndex={0}
            data-maymun="task"
            className={clsx('h-full overflow-y-auto', mobileTab !== 'task' && 'hidden')}
          >
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
