import { Camera, MessageSquarePlus, Send, Square, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Markdown } from '../components/Markdown.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { ChatError, provider, providers, streamChat, type ChatErrorKind, type ProviderId } from './ai.ts'
import { captureRegion, type Region } from './capture.ts'
import { readContext, systemPrompt, type PanelContext } from './context.ts'
import { Snip } from './Snip.tsx'
import { currentPanel } from './tracker.ts'
import { addToThread, forModel, getThread, markSummarized, newTopic, useThread, type Project, type StoredMessage } from './memory.ts'
import { aiStore, baseFor, isReady, modelFor, useMaymunAi } from './store.ts'
import { parseMemory, visibleText } from '../vault/maymun-memory.ts'
import { SESSION_GAP, summarize } from '../vault/sessions.ts'
import { applyMemory, memoryFor, saveSession, welcomeFor, type Welcome } from '../vault/store.ts'

type Context = ReturnType<typeof readContext>

/**
 * The chat with Maymun about one panel. Each question goes with that panel's context as it is when the question is
 * sent. The conversation belongs to the project (the game or challenge): every panel and step of it shares one,
 * kept on this device, and each question remembers where it was asked. A picture of any part of the screen can go
 * along with a question; `onSnip` hides the chat box while the learner chooses the area.
 */
export function MaymunChat({
  panel,
  context,
  project,
  projectTitle,
  onSnip,
}: {
  panel: HTMLElement | null
  context: Context
  project: Project
  /** The game's or challenge's name, told to Maymun. */
  projectTitle: string
  onSnip?: (active: boolean) => void
}) {
  const { t, lang } = useI18n()
  const ai = useMaymunAi()
  const { messages } = useThread(project.key)
  const [draft, setDraft] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<ChatErrorKind | null>(null)
  const [detail, setDetail] = useState('')
  const controller = useRef<AbortController | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const key = ai.keys[ai.provider]
  const ready = isReady(ai)
  const [shot, setShot] = useState<string | null>(null)
  const [snipping, setSnipping] = useState(false)
  const [shotFailed, setShotFailed] = useState(false)
  const seesImages = provider(ai.provider).images
  // What the memory vault adds to a question, shown in "what goes with your question" too.
  const [memoryPreview, setMemoryPreview] = useState('')
  useEffect(() => {
    let live = true
    void memoryFor(project.key, project.step).then((memory) => live && setMemoryPreview(memory.text))
    return () => {
      live = false
    }
  }, [project.key, project.step, messages.length])

  const startSnip = () => {
    setShotFailed(false)
    setSnipping(true)
    onSnip?.(true)
  }
  const cancelSnip = useCallback(() => {
    setSnipping(false)
    onSnip?.(false)
  }, [onSnip])
  const pick = async (region: Region) => {
    setSnipping(false)
    try {
      setShot(await captureRegion(region))
    } catch {
      setShotFailed(true)
    } finally {
      onSnip?.(false)
    }
  }

  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [messages, answer, error])

  // Coming back to a project after a break (or for the first time): where they were, and a skill due for review.
  const [welcome, setWelcome] = useState<Welcome | null>(null)
  // Measured from when the chat opened, so a message sent now ends the greeting.
  const [openedAt] = useState(() => Date.now())
  const lastAt = messages.at(-1)?.at
  const returning = !lastAt || openedAt - lastAt > SESSION_GAP
  useEffect(() => {
    let live = true
    void welcomeFor(project.key).then((w) => live && setWelcome(w))
    return () => {
      live = false
    }
  }, [project.key])
  const language = lang === 'tr' ? 'Turkish' : 'English'
  /**
   * Sums up the project's last session into the memory vault, in the background: when the learner comes back after a
   * break (`force` when they start a new topic).
   */
  const closeSession = (force: boolean) => {
    const thread = getThread(project.key)
    const pending = thread.messages.slice(thread.summarized ?? 0)
    const last = pending.at(-1)
    if (pending.length < 2 || !last) return
    if (!force && !(last.at && Date.now() - last.at > SESSION_GAP)) return
    markSummarized(project.key, thread.messages.length)
    const ended = new Date(last.at ?? Date.now())
    void summarize(pending, language).then((summary) => summary && saveSession(project.key, projectTitle, summary, ended))
  }

  const send = async () => {
    const image = shot && seesImages ? shot : undefined
    const question = draft.trim() || (image ? t('maymun.shotQuestion') : '')
    if (!question || !ready || controller.current) return
    // The panel the chat was opened on may be gone (the learner moved to another step): ask about what is there now.
    const el = panel?.isConnected ? panel : currentPanel()
    const current = el ? readContext(el) : context
    const asked: StoredMessage = {
      role: 'user',
      text: question,
      ...(image ? { image } : {}),
      tag: { panel: current.panel, ...(project.step ? { step: project.step } : {}) },
      at: Date.now(),
    }
    closeSession(false)
    const history = [...getThread(project.key).messages, asked]
    addToThread(project.key, asked)
    setDraft('')
    setShot(null)
    setError(null)
    setAnswer('')
    const abort = new AbortController()
    controller.current = abort
    let text = ''
    const memory = await memoryFor(project.key, project.step).catch(() => null)
    try {
      await streamChat({
        provider: ai.provider,
        key: key ?? '',
        base: baseFor(ai, ai.provider),
        model: modelFor(ai, ai.provider),
        system: systemPrompt(current, language, projectTitle, memory?.text),
        messages: forModel(history),
        signal: abort.signal,
        onText: (piece) => {
          text += piece
          // The memory block at the end is for the app, not for the learner.
          setAnswer(visibleText(text))
        },
      })
    } catch (caught) {
      setError(caught instanceof ChatError ? caught.kind : 'other')
      setDetail(caught instanceof Error ? caught.message : String(caught))
    } finally {
      if (text) {
        const { visible, ops } = parseMemory(text)
        const remembered = ops.length && memory ? await applyMemory(ops, memory.allowed).catch(() => []) : []
        if (visible) addToThread(project.key, { role: 'assistant', text: visible, at: Date.now(), ...(remembered.length ? { remembered } : {}) })
      }
      setAnswer(null)
      controller.current = null
    }
  }

  const busy = answer !== null

  return (
    <>
      <div ref={list} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        <details className="rounded-lg border border-border bg-surface-2 text-xs">
          <summary className="cursor-pointer px-3 py-2">
            {t('maymun.sends')} <strong>{t(`maymun.panel.${context.panel}` as Parameters<typeof t>[0])}</strong>
          </summary>
          <ContextText context={context} />
          {context.others.map((other) => (
            <ContextText key={other.panel} context={other} />
          ))}
          {memoryPreview && <ContextText context={{ title: t('maymun.memory'), text: memoryPreview }} />}
        </details>
        {!ready && <ProviderSetup compact />}
        {returning && welcome && (welcome.now || welcome.next || welcome.due.length > 0) && (
          <WelcomeBack welcome={welcome} onAsk={(text) => setDraft(text)} onClose={() => setWelcome(null)} />
        )}
        {messages.length === 0 && ready && <p className="text-muted">{t('maymun.empty')}</p>}
        {messages.map((message, i) => (
          <Bubble key={i} {...message} />
        ))}
        {busy && <Bubble role="assistant" text={answer || '…'} />}
        {error && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs">
            {error === 'network' && provider(ai.provider).local
              ? t('maymun.error.local', { address: baseFor(ai, ai.provider) })
              : t(`maymun.error.${error}`)}
            {detail && <span className="mt-1 block font-mono break-words text-muted">{detail}</span>}
          </p>
        )}
        {shotFailed && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs">
            {t('maymun.shotFailed')}
          </p>
        )}
      </div>
      {shot && (
        <div className="flex items-start gap-2 border-t border-border px-3 pt-2 text-xs">
          <span className="flex-1">
            {seesImages ? t('maymun.shotAttached') : t('maymun.shotNoImages')}
            <img src={shot} alt={t('maymun.shot')} className="mt-1 max-h-24 rounded border border-border" />
          </span>
          <button
            type="button"
            onClick={() => setShot(null)}
            aria-label={t('maymun.shotRemove')}
            title={t('maymun.shotRemove')}
            className="rounded-md p-1 text-muted hover:text-fg"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {snipping && <Snip onPick={(region) => void pick(region)} onCancel={cancelSnip} />}
      <form
        className="flex items-end gap-2 border-t border-border px-3 py-2"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              void send()
            }
          }}
          rows={2}
          disabled={!ready}
          placeholder={ready ? t('maymun.placeholder') : t('maymun.needKey')}
          aria-label={t('maymun.question')}
          className="min-h-0 flex-1 resize-none rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent disabled:opacity-60"
        />
        <button
          type="button"
          onClick={startSnip}
          disabled={!ready || busy || !seesImages}
          aria-label={t('maymun.shot')}
          title={seesImages ? t('maymun.shot') : t('maymun.shotNoImages')}
          className="rounded-lg p-2 text-muted hover:text-fg disabled:opacity-40"
        >
          <Camera size={16} />
        </button>
        {busy ? (
          <button
            type="button"
            onClick={() => controller.current?.abort()}
            aria-label={t('maymun.stop')}
            title={t('maymun.stop')}
            className="rounded-lg border border-border p-2 hover:bg-surface-2"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!ready || (!draft.trim() && !(shot && seesImages))}
            aria-label={t('maymun.send')}
            title={t('maymun.send')}
            className="rounded-lg bg-accent p-2 text-accent-fg disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            closeSession(true)
            newTopic(project.key)
            setError(null)
          }}
          disabled={busy || messages.length === 0}
          aria-label={t('maymun.newTopic')}
          title={t('maymun.newTopic')}
          className="rounded-lg p-2 text-muted hover:text-fg disabled:opacity-40"
        >
          <MessageSquarePlus size={16} />
        </button>
      </form>
    </>
  )
}

function Bubble({ role, text, image, shot, tag, remembered }: StoredMessage) {
  const { t } = useI18n()
  return role === 'user' ? (
    <div className="ml-8 rounded-lg bg-accent/15 px-3 py-2 whitespace-pre-wrap">
      {tag && (
        <span className="mb-0.5 block text-[11px] text-muted">
          {t('maymun.askedIn', { panel: t(`maymun.panel.${tag.panel}` as Parameters<typeof t>[0]) })}
          {tag.step && ` · ${tag.step}`}
        </span>
      )}
      {image ? (
        <img src={image} alt={t('maymun.shot')} className="mb-1 max-h-40 rounded border border-border" />
      ) : (
        shot && <span className="mb-1 block text-xs text-muted">📷 {t('maymun.shotGone')}</span>
      )}
      {text}
    </div>
  ) : (
    <div className="mr-4">
      <Markdown source={text} className="rounded-lg bg-surface-2 px-3 py-2" />
      {remembered && remembered.length > 0 && (
        <p className="mt-1 text-[11px] text-muted">
          📝 {t('maymun.remembered')}{' '}
          {remembered.map((path, i) => (
            <span key={path}>
              {i > 0 && ', '}
              <a href={`#/memory?f=${encodeURIComponent(path)}`} className="underline hover:text-fg">
                {path.split('/').at(-1)!.replace(/\.md$/, '')}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

/** "Last time you were…", "next…", and a skill due for review with a one-question offer; from the memory vault. */
function WelcomeBack({ welcome, onAsk, onClose }: { welcome: Welcome; onAsk: (text: string) => void; onClose: () => void }) {
  const { t } = useI18n()
  return (
    <div role="note" className="relative space-y-1.5 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-xs">
      <button
        type="button"
        onClick={onClose}
        aria-label={t('maymun.dismiss')}
        title={t('maymun.dismiss')}
        className="absolute top-1 right-1 rounded p-1 text-muted hover:text-fg"
      >
        <X size={12} />
      </button>
      <p className="pr-5 font-semibold">{t('maymun.welcome')}</p>
      {welcome.now && <p>{t('maymun.welcomeNow', { text: welcome.now })}</p>}
      {welcome.next && <p>{t('maymun.welcomeNext', { text: welcome.next })}</p>}
      {welcome.due.map((skill) => (
        <p key={skill.path} className="flex flex-wrap items-center gap-2">
          <span>{t('maymun.reviewDue', { skill: skill.title, last: skill.last })}</span>
          <button
            type="button"
            onClick={() => onAsk(t('maymun.reviewAsk', { skill: skill.title }))}
            className="rounded border border-border px-2 py-0.5 font-medium hover:bg-surface-2"
          >
            {t('maymun.reviewButton')}
          </button>
        </p>
      ))}
    </div>
  )
}

export function ContextText({ context }: { context: PanelContext }) {
  return (
    <div className="px-3 pb-3">
      <p className="font-medium">{context.title}</p>
      <pre className="max-h-60 overflow-y-auto font-mono whitespace-pre-wrap text-muted" tabIndex={0}>
        {context.text}
      </pre>
    </div>
  )
}

/** Choosing a service and entering its key. Used in the chat (before the first key) and in Settings. */
export function ProviderSetup({ compact = false }: { compact?: boolean }) {
  const { provider: id } = useMaymunAi()
  // A fresh form per service, so switching shows that service's saved key and model.
  return <ProviderForm key={id} compact={compact} />
}

function ProviderForm({ compact }: { compact: boolean }) {
  const { t } = useI18n()
  const ai = useMaymunAi()
  const current = provider(ai.provider)
  const [key, setKey] = useState(ai.keys[ai.provider] ?? '')
  const [model, setModel] = useState(ai.models[ai.provider] ?? '')
  const [base, setBase] = useState(ai.bases[ai.provider] ?? '')

  const save = () =>
    aiStore.set((value) => ({
      ...value,
      keys: { ...value.keys, [value.provider]: key.trim() || undefined },
      models: { ...value.models, [value.provider]: model.trim() || undefined },
      bases: { ...value.bases, [value.provider]: base.trim() || undefined },
    }))

  const field = 'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm'
  return (
    <form
      className={`space-y-2 ${compact ? 'rounded-lg border border-border p-3' : ''}`}
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      {compact && <p className="text-xs">{t('maymun.setup')}</p>}
      <label className="block text-xs font-medium">
        {t('maymun.provider')}
        <select
          value={ai.provider}
          onChange={(event) => aiStore.set((value) => ({ ...value, provider: event.target.value as ProviderId }))}
          className={`${field} mt-1`}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.local ? t(`maymun.service.${p.id}` as Parameters<typeof t>[0]) : p.name}
            </option>
          ))}
        </select>
      </label>
      {current.id === 'bridge' && <BridgeHelp />}
      {current.id === 'custom' && <p className="text-xs text-muted">{t('maymun.custom.help')}</p>}
      {current.local && (
        <label className="block text-xs font-medium">
          {t('maymun.address')}
          <input
            value={base}
            onChange={(event) => setBase(event.target.value)}
            placeholder={current.base}
            spellCheck={false}
            className={`${field} mt-1 font-mono`}
          />
        </label>
      )}
      <label className="block text-xs font-medium">
        {current.id === 'bridge' ? t('maymun.bridge.key') : t('maymun.key')}
        {current.keyOptional && <span className="font-normal text-muted"> {t('maymun.optional')}</span>}{' '}
        {current.keys && (
          <a href={current.keys} target="_blank" rel="noreferrer" className="font-normal text-accent underline">
            {t('maymun.getKey')}
          </a>
        )}
        <input
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          className={`${field} mt-1 font-mono`}
        />
      </label>
      <label className="block text-xs font-medium">
        {t('maymun.model')}
        <input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder={current.model || t('maymun.modelNeeded')}
          spellCheck={false}
          className={`${field} mt-1 font-mono`}
        />
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg">
          {t('maymun.save')}
        </button>
        {ai.keys[ai.provider] && (
          <button
            type="button"
            onClick={() => {
              setKey('')
              aiStore.set((value) => ({ ...value, keys: { ...value.keys, [value.provider]: undefined } }))
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          >
            {t('maymun.forget')}
          </button>
        )}
      </div>
      <p className="text-xs text-muted">{current.local ? t('maymun.privacyLocal') : t('maymun.privacy')}</p>
    </form>
  )
}

/** How to start the bridge on this computer; the command already allows this site. */
function BridgeHelp() {
  const { t } = useI18n()
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
  const command = `node maymun-bridge.mjs${local ? '' : ` --origin ${location.origin}`}`
  return (
    <div className="space-y-1 rounded-lg bg-surface-2 p-3 text-xs">
      <p>{t('maymun.bridge.intro')}</p>
      <ol className="list-decimal space-y-1 pl-4">
        <li>{t('maymun.bridge.step1')}</li>
        <li>
          <a href={`${import.meta.env.BASE_URL}maymun-bridge.mjs`} download className="text-accent underline">
            maymun-bridge.mjs
          </a>{' '}
          {t('maymun.bridge.step2')}
          <code className="mt-1 block rounded bg-surface px-2 py-1 font-mono break-all">{command}</code>
        </li>
        <li>{t('maymun.bridge.step3')}</li>
      </ol>
      <p className="text-muted">{t('maymun.bridge.terms')}</p>
    </div>
  )
}
