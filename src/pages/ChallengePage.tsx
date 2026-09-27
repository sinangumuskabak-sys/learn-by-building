import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Group, Panel } from 'react-resizable-panels'
import { CodeWorkspace, ResizeHandle } from '../challenge/CodeWorkspace.tsx'
import { DesignPanel } from '../challenge/DesignPanel.tsx'
import { QuizPanel } from '../challenge/QuizPanel.tsx'
import { TaskPanel } from '../challenge/TaskPanel.tsx'
import { catalog, type ChallengeEntry } from '../content/catalog.ts'
import { runnableTypes } from '../content/schema.ts'
import { IconButton } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useDocumentTitle, useMediaQuery } from '../lib/hooks.ts'
import { useProgress } from '../progress/progress.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

const CodeEditor = lazy(() => import('../editor/CodeEditor.tsx'))

function neighbours(entry: ChallengeEntry) {
  return { previous: catalog.order[entry.index - 1], next: catalog.order[entry.index + 1] }
}

/** Shown under the task once the challenge is completed. */
function NextStep({ entry }: { entry: ChallengeEntry }) {
  const { t } = useI18n()
  const passed = useProgress().challenges[entry.challenge.id]?.status === 'passed'
  const { next } = neighbours(entry)
  if (!passed || !next) return null
  const nextEntry = catalog.challenges.get(next)!
  return (
    <Link
      to={`/learn/${next}`}
      className="group flex items-center gap-3 rounded-xl border border-success/40 bg-success/8 p-4 transition-colors hover:border-success"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-success">{t('challenge.next')}</span>
        <span className="block truncate font-medium">{nextEntry.challenge.title}</span>
      </span>
      <ArrowRight size={18} className="text-success transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}

function ChallengeHeader({ entry }: { entry: ChallengeEntry }) {
  const { t, l } = useI18n()
  const navigate = useNavigate()
  const { previous, next } = neighbours(entry)
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-4">
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        <Link to={`/c/${entry.category.id}`} className="shrink-0 text-muted hover:text-fg">
          {l(entry.category.title)}
        </Link>
        <ChevronRight size={14} className="shrink-0 text-muted" aria-hidden />
        <span className="hidden shrink-0 text-muted sm:inline">{l(entry.module.title)}</span>
        <ChevronRight size={14} className="hidden shrink-0 text-muted sm:inline" aria-hidden />
        <span className="truncate font-medium" aria-current="page">
          {entry.challenge.title}
        </span>
      </nav>
      <IconButton label={t('challenge.previous')} disabled={!previous} onClick={() => navigate(`/learn/${previous}`)}>
        <ChevronLeft size={18} />
      </IconButton>
      <span className="text-xs text-muted tabular-nums">
        {entry.index + 1}/{catalog.order.length}
      </span>
      <IconButton label={t('challenge.next')} disabled={!next} onClick={() => navigate(`/learn/${next}`)}>
        <ChevronRight size={18} />
      </IconButton>
    </div>
  )
}

function ReadWorkspace({ entry }: { entry: ChallengeEntry }) {
  const { t } = useI18n()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { challenge } = entry
  const code = (
    <section className="flex h-full min-h-72 flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <h2 className="shrink-0 border-b border-border px-4 py-2 text-xs font-semibold tracking-wide text-muted uppercase">
        {t('challenge.readCode')}
      </h2>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-4 text-sm text-muted">…</div>}>
          {challenge.seed.map((file) => (
            <CodeEditor
              key={file.name}
              path={`${challenge.id}/${file.name}`}
              lang={file.lang}
              value={file.contents}
              readOnly
              label={`${challenge.title} — ${file.name}`}
            />
          ))}
        </Suspense>
      </div>
    </section>
  )
  const questions = (
    <div className="space-y-6">
      <QuizPanel challenge={challenge} />
      <NextStep entry={entry} />
    </div>
  )

  if (!isDesktop) {
    return (
      <div tabIndex={0} className="h-full overflow-y-auto">
        <TaskPanel challenge={challenge}>
          <div className="h-80">{code}</div>
          {questions}
        </TaskPanel>
      </div>
    )
  }
  return (
    <Group orientation="horizontal" className="h-full">
      <Panel defaultSize="55%" minSize="30%">
        <div className="flex h-full flex-col gap-4 overflow-y-auto border-r border-border">
          <TaskPanel challenge={challenge} />
          <div className="min-h-80 flex-1 px-5 pb-5 sm:px-6">{code}</div>
        </div>
      </Panel>
      <ResizeHandle />
      <Panel defaultSize="45%" minSize="30%">
        <div tabIndex={0} className="h-full overflow-y-auto p-5 sm:p-6">{questions}</div>
      </Panel>
    </Group>
  )
}

export function ChallengePage() {
  const { challengeId = '' } = useParams()
  const { t } = useI18n()
  const entry = catalog.challenges.get(challengeId)
  useDocumentTitle(entry?.challenge.title ?? t('challenge.notFound'))
  if (!entry) return <NotFoundPage title={t('challenge.notFound')} />
  const { challenge } = entry

  let body
  if (runnableTypes.includes(challenge.type)) {
    body = <CodeWorkspace key={challenge.id} challenge={challenge} footer={<NextStep entry={entry} />} />
  } else if (challenge.type === 'read') {
    body = <ReadWorkspace key={challenge.id} entry={entry} />
  } else {
    body = (
      <div tabIndex={0} className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          <TaskPanel challenge={challenge}>
            {challenge.type === 'quiz' ? (
              <QuizPanel key={challenge.id} challenge={challenge} />
            ) : (
              <DesignPanel key={challenge.id} challenge={challenge} />
            )}
            <NextStep entry={entry} />
          </TaskPanel>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ChallengeHeader entry={entry} />
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  )
}
