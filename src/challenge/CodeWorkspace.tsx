import clsx from 'clsx'
import { CheckCircle2, Eye, Loader2, Play, RotateCcw } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { Challenge, CodeFile } from '../content/schema.ts'
import { ConfirmButton } from '../components/ConfirmButton.tsx'
import { Button } from '../components/ui.tsx'
import { useI18n } from '../i18n/i18n.ts'
import type { MessageKey } from '../i18n/messages.ts'
import { useDebouncedEffect, useMediaQuery } from '../lib/hooks.ts'
import { formatChecks, useMaymunContext } from '../maymun/context.ts'
import { progressActions, useProgress } from '../progress/progress.ts'
import { previewDocument } from '../runners/web-document.ts'
import { allPassed, type RunResult } from '../runners/types.ts'
import { TaskPanel, TestList } from './TaskPanel.tsx'

const CodeEditor = lazy(() => import('../editor/CodeEditor.tsx'))

type OutputTab = 'tests' | 'console' | 'table' | 'preview'
type MobileTab = 'task' | 'code' | 'result'

export function ResizeHandle() {
  return (
    <Separator className="group relative w-px shrink-0 bg-border outline-none data-[separator=active]:bg-accent">
      <span className="absolute inset-y-0 -right-1.5 -left-1.5 group-hover:bg-accent/20 group-focus-visible:bg-accent/30" />
    </Separator>
  )
}

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex shrink-0 gap-1 overflow-x-auto overflow-y-hidden border-b border-border px-2 [scrollbar-width:none]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            '-mb-px border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition-colors',
            active === tab.id ? 'border-accent font-medium text-fg' : 'border-transparent text-muted hover:text-fg',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function StatusBanner({ result, total }: { result: RunResult | null; total: number }) {
  const { t } = useI18n()
  if (!result) return <p className="text-sm text-muted">{t('challenge.notRun')}</p>
  if (allPassed(result)) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-success">
        <CheckCircle2 size={18} aria-hidden />
        {t('challenge.passed')}
      </p>
    )
  }
  const failed = result.tests.filter((test) => !test.passed).length
  return (
    <div role="status" className="space-y-2">
      <p className="text-sm font-medium text-danger">{t('challenge.failed', { failed, total })}</p>
      {result.error && (
        <pre className="overflow-x-auto rounded-lg border border-danger/30 bg-danger/8 p-3 font-mono text-xs whitespace-pre-wrap text-danger">
          {result.error}
        </pre>
      )}
    </div>
  )
}

export function CodeWorkspace({ challenge, footer }: { challenge: Challenge; footer: ReactNode }) {
  const { t } = useI18n()
  const saved = useProgress().challenges[challenge.id]
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [files, setFiles] = useState<CodeFile[]>(() => saved?.files ?? challenge.seed)
  const [activeFile, setActiveFile] = useState(0)
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [outputTab, setOutputTab] = useState<OutputTab>(challenge.type === 'web' ? 'preview' : 'tests')
  const [mobileTab, setMobileTab] = useState<MobileTab>('task')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  // Only the first document goes through React; later updates are debounced to avoid reloading on every keystroke.
  const [initialDocument] = useState(() => previewDocument(files))
  const dirty = useRef(false)

  useDebouncedEffect(
    files,
    400,
    (value) => {
      if (dirty.current) progressActions.saveFiles(challenge.id, value)
    },
    { flushOnLeave: true },
  )

  // Live preview for web challenges; the test run reloads the frame itself.
  useDebouncedEffect(files, 500, (value) => {
    if (challenge.type === 'web' && iframeRef.current && !running) iframeRef.current.srcdoc = previewDocument(value)
  })

  const run = useCallback(async () => {
    if (running) return
    setRunning(true)
    try {
      let next: RunResult
      if (challenge.type === 'web' && iframeRef.current) {
        const { runWebInIframe } = await import('../runners/browser.ts')
        next = await runWebInIframe(iframeRef.current, challenge, files)
      } else {
        const { runChallenge } = await import('../runners/browser.ts')
        next = await runChallenge(challenge, files)
      }
      setResult(next)
      if (allPassed(next)) progressActions.markPassed(challenge.id)
      if (challenge.type !== 'web' || !allPassed(next)) setOutputTab(next.table ? 'table' : 'tests')
      setMobileTab('result')
    } finally {
      setRunning(false)
    }
  }, [challenge, files, running])

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

  const updateFile = (index: number, contents: string) => {
    dirty.current = true
    setFiles((current) => current.map((file, i) => (i === index ? { ...file, contents } : file)))
  }

  const replaceFiles = (next: CodeFile[]) => {
    dirty.current = true
    setFiles(next)
    setResult(null)
  }

  const file = files[activeFile] ?? files[0]

  const runButton = (
    <Button variant="primary" size="sm" onClick={() => void run()} disabled={running} title={t('challenge.shortcut')}>
      {running ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Play size={15} aria-hidden />}
      {running ? t('challenge.running') : t('challenge.run')}
      <kbd className="hidden rounded bg-black/15 px-1.5 py-0.5 font-sans text-[10px] xl:inline">Ctrl ↵</kbd>
    </Button>
  )

  const codeText = () => files.map((file) => `File ${file.name}:\n${file.contents}`).join('\n\n')
  useMaymunContext('code', () => ({
    title: `${challenge.title} — ${files[activeFile]?.name ?? ''}`,
    text: [
      `Task:\n${challenge.description}\n\n${challenge.instructions}`,
      codeText(),
      result ? `Checks:\n${formatChecks(result)}` : 'Checks: not run yet.',
    ].join('\n\n'),
  }))
  useMaymunContext('results', () => ({
    title: `${challenge.title} — ${t('challenge.tabResult')}`,
    text: [
      result ? formatChecks(result) : 'Checks: not run yet.',
      result && result.logs.length > 0 ? `Console:\n${result.logs.join('\n')}` : '',
      codeText(),
    ]
      .filter(Boolean)
      .join('\n\n'),
  }))

  const editorPanel = (
    <div data-maymun="code" className="flex h-full min-h-0 flex-col bg-surface">
      {/* Every file tab stays visible (a task may send the learner to any file); the buttons wrap below if needed. */}
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        <div role="tablist" aria-label={t('challenge.tabCode')} className="flex min-w-fit flex-1 flex-wrap gap-1">
          {files.map((f, index) => (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={index === activeFile}
              onClick={() => setActiveFile(index)}
              className={clsx(
                'rounded-md px-2.5 py-1 font-mono text-xs whitespace-nowrap',
                index === activeFile ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
        <ConfirmButton confirmLabel={t('challenge.solutionConfirm')} label={t('challenge.solution')} onConfirm={() => replaceFiles(challenge.solutions[0])}>
          <Eye size={15} aria-hidden />
          <span className="hidden xl:inline">{t('challenge.solution')}</span>
        </ConfirmButton>
        <ConfirmButton confirmLabel={t('challenge.resetConfirm')} label={t('challenge.reset')} onConfirm={() => replaceFiles(challenge.seed)}>
          <RotateCcw size={15} aria-hidden />
          <span className="hidden xl:inline">{t('challenge.reset')}</span>
        </ConfirmButton>
        {isDesktop && runButton}
      </div>
      <div className="min-h-0 flex-1">
        <Suspense fallback={<div className="p-4 text-sm text-muted">…</div>}>
          {file && (
            <CodeEditor
              path={`${challenge.id}/${file.name}`}
              lang={file.lang}
              value={file.contents}
              onChange={(value) => updateFile(files.indexOf(file), value)}
              onRun={() => void run()}
              label={`${challenge.title} — ${file.name}`}
            />
          )}
        </Suspense>
      </div>
    </div>
  )

  const outputTabs: { id: OutputTab; label: string }[] = [
    ...(challenge.type === 'web' ? [{ id: 'preview' as const, label: t('challenge.preview') }] : []),
    { id: 'tests', label: t('challenge.tests') },
    ...(challenge.type === 'sql' ? [{ id: 'table' as const, label: t('challenge.result') }] : []),
    { id: 'console', label: t('challenge.console') },
  ]

  const outputPanel = (
    <div data-maymun="results" className="flex h-full min-h-0 flex-col bg-surface">
      <TabBar tabs={outputTabs} active={outputTab} onChange={setOutputTab} label={t('challenge.tabResult')} />
      <div className={clsx('min-h-0 flex-1 overflow-y-auto', outputTab === 'preview' && 'hidden')}>
        <div className="space-y-4 p-4">
          {outputTab === 'tests' && (
            <>
              <StatusBanner result={result} total={challenge.tests.length} />
              <TestList challenge={challenge} result={result} />
            </>
          )}
          {outputTab === 'console' &&
            (result?.logs.length ? (
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">{result.logs.join('\n')}</pre>
            ) : (
              <p className="text-sm text-muted">{t('challenge.noLogs')}</p>
            ))}
          {outputTab === 'table' && (
            <>
              {result && <StatusBanner result={result} total={challenge.tests.length} />}
              <SqlTable result={result} />
            </>
          )}
        </div>
      </div>
      {challenge.type === 'web' && (
        <iframe
          ref={iframeRef}
          title={t('challenge.preview')}
          // No allow-same-origin: the learner's page must not reach the site's storage (progress, AI keys).
          sandbox="allow-scripts allow-modals"
          data-snapshot=""
          srcDoc={initialDocument}
          className={clsx('min-h-0 w-full flex-1 bg-white', outputTab !== 'preview' && 'hidden')}
        />
      )}
      {challenge.type === 'web' && outputTab === 'preview' && result && (
        <div className="shrink-0 border-t border-border p-3">
          <StatusBanner result={result} total={challenge.tests.length} />
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Group orientation="horizontal" className="h-full">
        <Panel defaultSize="32%" minSize="20%">
          <div tabIndex={0} data-maymun="task" className="h-full overflow-y-auto border-r border-border">
            <TaskPanel challenge={challenge}>{footer}</TaskPanel>
          </div>
        </Panel>
        <ResizeHandle />
        <Panel defaultSize="40%" minSize="25%">
          {editorPanel}
        </Panel>
        <ResizeHandle />
        <Panel defaultSize="28%" minSize="18%">
          {outputPanel}
        </Panel>
      </Group>
    )
  }

  const mobileTabs: { id: MobileTab; label: MessageKey }[] = [
    { id: 'task', label: 'challenge.tabTask' },
    { id: 'code', label: 'challenge.tabCode' },
    { id: 'result', label: 'challenge.tabResult' },
  ]
  return (
    <div className="flex h-full flex-col">
      <TabBar
        tabs={mobileTabs.map((tab) => ({ id: tab.id, label: t(tab.label) }))}
        active={mobileTab}
        onChange={setMobileTab}
        label={challenge.title}
      />
      <div className="min-h-0 flex-1">
        <div tabIndex={0} data-maymun="task" className={clsx('h-full overflow-y-auto', mobileTab !== 'task' && 'hidden')}>
          <TaskPanel challenge={challenge}>{footer}</TaskPanel>
        </div>
        <div className={clsx('h-full', mobileTab !== 'code' && 'hidden')}>{editorPanel}</div>
        <div className={clsx('h-full', mobileTab !== 'result' && 'hidden')}>{outputPanel}</div>
      </div>
      <div className="shrink-0 border-t border-border bg-surface p-3">{runButton}</div>
    </div>
  )
}

function SqlTable({ result }: { result: RunResult | null }) {
  const { t } = useI18n()
  if (!result?.table) return <p className="text-sm text-muted">{t('challenge.notRun')}</p>
  const { columns, rows } = result.table
  if (rows.length === 0) return <p className="text-sm text-muted">{t('challenge.noRows')}</p>
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left font-mono text-xs">
        <thead className="bg-surface-2 text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td key={i} className="px-3 py-1.5 whitespace-nowrap">
                  {cell === null ? <span className="text-muted">NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
