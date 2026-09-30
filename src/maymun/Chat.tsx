import { Camera, MessageSquarePlus, Send, Square, Trash2, X } from 'lucide-react'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Markdown } from '../components/Markdown.tsx'
import { useI18n } from '../i18n/i18n.ts'
import { useMediaQuery } from '../lib/hooks.ts'
import { ChatError, provider, providers, streamChatWithFallback, type ChatErrorKind, type ProviderId } from './ai.ts'
import { canChat, groupModels, listModels, rankModels, type ListedModel, type OfferedModel } from './models.ts'
import { captureRegion, type Region } from './capture.ts'
import { APP_MAP_MARKER, appMap, asksForMap, mayAskForMap } from './app-map.ts'
import { readContext, systemPrompt, type PanelContext } from './context.ts'
import { Snip } from './Snip.tsx'
import { currentPanel } from './tracker.ts'
import { addMessages, deletePage, forModel, getTimeline, loadTimeline, markSessions, newChat, projectsOf, useTimeline, type Project, type StoredMessage } from './memory.ts'
import { fold, startOverAfterBreak } from './fold.ts'
import { asksForPages, conversationPrompt, mayAskForPages, pagesBefore, recalled, relatedPage, windowStart } from './window.ts'
import { aiStore, baseFor, isReady, modelFor, modelsFor, useMaymunAi } from './store.ts'
import { progressStore } from '../progress/progress.ts'
import { parseMemory, visibleText } from '../vault/maymun-memory.ts'
import { SESSION_GAP, summarize } from '../vault/sessions.ts'
import { applyMemory, memoryFor, saveSession, welcomeFor, type Welcome } from '../vault/store.ts'

type Context = ReturnType<typeof readContext>

/** Pages of the conversation the chat shows at first, and adds with each "Earlier messages". */
const SHOWN_PAGES = 4

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
  const { pathname } = useLocation()
  const ai = useMaymunAi()
  const timeline = useTimeline()
  const { messages } = timeline
  // How many pages the chat shows; "Earlier messages" shows more (nothing is ever deleted).
  const [shownPages, setShownPages] = useState(SHOWN_PAGES)
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
  // The last word in this project since the chat started over; the greeting is for coming back to it.
  const owners = projectsOf(messages)
  const lastAt = messages.findLast((m, i) => i >= timeline.windowFrom && owners[i] === project.key && m.at)?.at
  const returning = !lastAt || openedAt - lastAt > SESSION_GAP
  useEffect(() => {
    let live = true
    void welcomeFor(project.key).then((w) => live && setWelcome(w))
    return () => {
      live = false
    }
  }, [project.key])
  const language = lang === 'tr' ? 'Turkish' : 'English'
  // Back after a long break: a clean window; and pages that left the window go into the summary.
  useEffect(() => {
    void loadTimeline().then(() => {
      startOverAfterBreak()
      void fold(language)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  /**
   * Sums up the project's last session into the memory vault, in the background: when the learner comes back after a
   * break (`force` when they start a new topic).
   */
  const closeSession = (force: boolean) => {
    const all = getTimeline().messages
    const from = getTimeline().sessionFrom
    const last = all.at(-1)
    if (all.length - from < 2 || !last) return
    if (!force && !(last.at && Date.now() - last.at > SESSION_GAP)) return
    markSessions(all.length)
    // One session note for each game or challenge talked about (the conversation goes across projects).
    const owners = projectsOf(all)
    const byProject = new Map<string, StoredMessage[]>()
    all.slice(from).forEach((m, i) => {
      const key = owners[from + i]
      if (key && key !== 'general') byProject.set(key, [...(byProject.get(key) ?? []), m])
    })
    for (const [key, pending] of byProject) {
      const ended = new Date(pending.at(-1)!.at ?? Date.now())
      const title = key === project.key ? projectTitle : pending.find((m) => m.tag?.page)?.tag?.page ?? key
      void summarize(pending, language).then((summary) => summary && saveSession(key, title, summary, ended))
    }
  }

  const send = async () => {
    const image = shot && seesImages ? shot : undefined
    const question = draft.trim() || (image ? t('maymun.shotQuestion') : '')
    if (!question || !ready || controller.current) return
    // The panel the chat was opened on may be gone (the learner moved to another step): ask about what is there now.
    // The panel the chat was opened on; after moving to another page (it is gone), the panels of the page shown now.
    const el = panel?.isConnected ? panel : currentPanel()
    const current = el ? readContext(el) : context
    const asked: StoredMessage = {
      role: 'user',
      text: question,
      ...(image ? { image } : {}),
      tag: { panel: current.panel, ...(project.step ? { step: project.step } : {}), page: pageTitle(), project: project.key },
      at: Date.now(),
    }
    closeSession(false)
    startOverAfterBreak()
    const timeline = getTimeline()
    const previousPage = timeline.messages.findLast((m) => m.role === 'user')?.tag?.page
    // The latest messages word for word; the rest as a summary, an index, and a page found by the question's words.
    const from = windowStart(timeline, [asked])
    const history = [...timeline.messages, asked].slice(from)
    const related = relatedPage(pagesBefore(timeline, from), question, project.key)
    const conversation = conversationPrompt(timeline, from, related)
    let looked = related ? [related.n] : []
    addMessages(asked)
    setDraft('')
    setShot(null)
    setError(null)
    setAnswer('')
    const abort = new AbortController()
    controller.current = abort
    let text = ''
    let answeredBy = ''
    const memory = await memoryFor(project.key, project.step).catch(() => null)
    const ask = (map?: string, pages?: string) =>
      streamChatWithFallback({
        provider: ai.provider,
        key: key ?? '',
        base: baseFor(ai, ai.provider),
        model: modelFor(ai, ai.provider),
        system: systemPrompt(current, language, project.key === 'general' ? undefined : projectTitle, [conversation, memory?.text, pages].filter(Boolean).join('\n\n'), {
          path: pathname,
          title: pageTitle(),
          previous: previousPage && previousPage !== pageTitle() ? previousPage : undefined,
        }, map),
        messages: forModel(history),
        signal: abort.signal,
        onText: (piece) => {
          text += piece
          // A request for the app map or for earlier pages is for the app; so is the memory block at the end.
          if ((!map && mayAskForMap(text)) || (!pages && mayAskForPages(text))) return
          setAnswer(visibleText(map ? text.replace(APP_MAP_MARKER, '') : text))
        },
      }, modelsFor(ai, ai.provider), (model) => (answeredBy = model))
    try {
      await ask()
      // Maymun asked for the map of the whole app, or for earlier pages: ask again with them, once each.
      let map: string | undefined
      let pages: string | undefined
      for (let round = 0; round < 2 && !abort.signal.aborted; round++) {
        const wanted = !pages && asksForPages(text)
        if (!map && asksForMap(text)) map = appMap(lang, progressStore.get())
        else if (wanted) {
          const found = recalled(getTimeline(), wanted, project.key)
          pages = found.text
          looked = [...new Set([...looked, ...found.pages.map((p) => p.n)])]
        } else break
        text = ''
        await ask(map, pages)
      }
      // Asked a third time instead of answering: the request itself is not an answer.
      text = text.replace(APP_MAP_MARKER, '').replace(/^\s*<recall[^>]*>/, '')
    } catch (caught) {
      setError(caught instanceof ChatError ? caught.kind : 'other')
      setDetail(caught instanceof Error ? caught.message : String(caught))
    } finally {
      if (text) {
        const { visible, ops } = parseMemory(text)
        const remembered = ops.length && memory ? await applyMemory(ops, memory.allowed).catch(() => []) : []
        const via = provider(ai.provider).gateway && answeredBy ? { model: answeredBy } : {}
        if (visible) addMessages({ role: 'assistant', text: visible, at: Date.now(), ...via, ...(remembered.length ? { remembered } : {}), ...(looked.length ? { recalled: looked } : {}) })
        void fold(language)
      }
      setAnswer(null)
      controller.current = null
    }
  }

  const busy = answer !== null
  const conversationPreview = conversationPrompt(timeline, windowStart(timeline), null)
  // The page each shown page starts at, by the index of its first message.
  const pageStarts = new Map<number, number>()
  timeline.pages.reduce((at, page) => (pageStarts.set(at, page.n), at + page.messages.length), 0)
  const firstShown = timeline.pages.length > shownPages ? timeline.pages.slice(0, -shownPages).reduce((sum, p) => sum + p.messages.length, 0) : 0

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
          {conversationPreview && <ContextText context={{ title: t('maymun.conversation'), text: conversationPreview }} />}
          {memoryPreview && <ContextText context={{ title: t('maymun.memory'), text: memoryPreview }} />}
        </details>
        {!ready && <ProviderSetup compact />}
        {returning && welcome && (welcome.now || welcome.next || welcome.due.length > 0) && (
          <WelcomeBack welcome={welcome} onAsk={(text) => setDraft(text)} onClose={() => setWelcome(null)} />
        )}
        {messages.length === 0 && ready && <p className="text-muted">{t('maymun.empty')}</p>}
        {firstShown > 0 && (
          <button
            type="button"
            onClick={() => setShownPages((n) => n + SHOWN_PAGES)}
            className="mx-auto block rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-fg"
          >
            {t('maymun.older')}
          </button>
        )}
        {messages.slice(firstShown).map((message, j) => {
          const i = firstShown + j
          const moved = message.role === 'user' && i > firstShown && owners[i] !== owners[i - 1]
          return (
            <Fragment key={i}>
              {i === timeline.windowFrom && i > firstShown && <Divider text={t('maymun.newChatDivider')} />}
              {moved && i !== timeline.windowFrom && <Divider text={message.tag?.page ?? t('maymun.general')} />}
              {pageStarts.has(i) && <PageMark n={pageStarts.get(i)!} disabled={busy} />}
              <Bubble {...message} />
            </Fragment>
          )
        })}
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
            newChat()
            setError(null)
          }}
          disabled={busy || messages.length === timeline.windowFrom}
          aria-label={t('maymun.newChat')}
          title={t('maymun.newChat')}
          className="rounded-lg p-2 text-muted hover:text-fg disabled:opacity-40"
        >
          <MessageSquarePlus size={16} />
        </button>
      </form>
    </>
  )
}

function Bubble({ role, text, image, shot, tag, remembered, model, recalled: looked }: StoredMessage) {
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
      <span>{text}</span>
    </div>
  ) : (
    <div className="mr-4">
      <Markdown source={text} className="rounded-lg bg-surface-2 px-3 py-2" />
      {model && <p className="mt-1 font-mono text-[11px] text-muted">{t('maymun.answeredBy', { model })}</p>}
      {looked && looked.length > 0 && (
        <p className="mt-1 text-[11px] text-muted">
          🔎 {t('maymun.recalled', { pages: looked.map((n) => t('maymun.page', { n })).join(', ') })}
        </p>
      )}
      {remembered && remembered.length > 0 && (
        <p className="mt-1 text-[11px] text-muted">
          📝 {t('maymun.remembered')}{' '}
          {remembered.map((path, i) => (
            <span key={path}>
              {i > 0 && ', '}
              <Link to={`/memory?f=${encodeURIComponent(path)}`} className="underline hover:text-fg">
                {path.split('/').at(-1)!.replace(/\.md$/, '')}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

/** A thin line across the chat with a word on it: another project, or a new chat. */
function Divider({ text }: { text: string }) {
  return (
    <p role="separator" className="flex items-center gap-2 text-[11px] text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      {text}
    </p>
  )
}

/** Where a page of the conversation starts: its number (Maymun's "p.3"), and deleting it, with a second click to confirm. */
function PageMark({ n, disabled }: { n: number; disabled: boolean }) {
  const { t } = useI18n()
  const [sure, setSure] = useState(false)
  return (
    <p className="group flex items-center justify-end gap-1 text-[10px] text-muted">
      <span>{t('maymun.page', { n })}</span>
      {sure ? (
        <>
          <button type="button" onClick={() => deletePage(n)} className="rounded border border-danger/50 px-1.5 text-danger hover:bg-danger/10">
            {t('maymun.deletePageSure', { n })}
          </button>
          <button type="button" onClick={() => setSure(false)} aria-label={t('maymun.dismiss')} title={t('maymun.dismiss')} className="rounded p-0.5 hover:text-fg">
            <X size={11} />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setSure(true)}
          disabled={disabled}
          aria-label={t('maymun.deletePage', { n })}
          title={t('maymun.deletePage', { n })}
          className="rounded p-0.5 opacity-40 group-hover:opacity-100 hover:text-fg focus-visible:opacity-100 disabled:hidden"
        >
          <Trash2 size={11} />
        </button>
      )}
    </p>
  )
}

/** The page's title as the tab shows it, without the site name. */
const pageTitle = () => document.title.replace(/ · Learn by Building$/, '') || 'Learn by Building'

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
  // A server on this computer (OmniRoute, Ollama) says which models it has. Asked once the address and key are saved.
  const [offered, setOffered] = useState<string[]>([])
  const savedKey = ai.keys[ai.provider]
  const savedBase = baseFor(ai, ai.provider)
  // An online service's models, to pick from a list (OpenRouter's is public; the others need the saved key).
  // Kept with the service it came from, so switching services never shows the previous one's list.
  const [listing, setListing] = useState<{ id: ProviderId; models: OfferedModel[] } | null>(null)
  const listed = !current.local && listing?.id === current.id ? listing.models : []
  const [typingFor, setTypingFor] = useState<ProviderId | null>(null)
  const typing = typingFor === current.id
  const setTyping = (on: boolean) => setTypingFor(on ? current.id : null)
  useEffect(() => {
    if (current.local) return
    let live = true
    listModels(current.id, savedKey)
      .then((models) => live && setListing({ id: current.id, models }))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [current.local, current.id, savedKey])
  useEffect(() => {
    if (!current.local || !savedBase) return
    let live = true
    const headers: Record<string, string> = savedKey ? { Authorization: `Bearer ${savedKey}` } : {}
    const root = savedBase.replace(/\/+$/, '')
    fetch(`${root}/models`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { data?: ListedModel[] } | null) => {
        if (!live || !data?.data) return
        setOffered(data.data.filter(canChat).map((m) => String(m.id)).filter(Boolean))
        // Picture or video models turned on before they were left out of the list would only fail when their turn came.
        const cannot = new Set(data.data.filter((m) => !canChat(m)).map((m) => String(m.id)))
        if ((aiStore.get().active[current.id] ?? []).some((m) => cannot.has(m))) {
          aiStore.set((value) => ({
            ...value,
            active: { ...value.active, [current.id]: (value.active[current.id] ?? []).filter((m) => !cannot.has(m)) },
          }))
        }
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [current.local, current.id, savedBase, savedKey])

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
      {current.id === 'custom' && <p className="text-xs text-muted">{t('maymun.custom.help')}</p>}
      {current.id === 'omniroute' && (
        <p className="text-xs text-muted">
          {t('maymun.omniroute.help')}{' '}
          <a href="https://github.com/diegosouzapw/OmniRoute" target="_blank" rel="noreferrer" className="text-accent underline">
            {t('maymun.omniroute.repo')}
          </a>
        </p>
      )}
      {current.local && <LocalNote />}
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
        {t('maymun.key')}
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
      {current.gateway && ai.keys[ai.provider] && <GatewayModels id={current.id} offered={offered} />}
      {listed.length > 0 && (
        <ModelPicker
          models={listed}
          value={model || current.model}
          onChange={(id) => {
            if (id === OTHER) return setTyping(true)
            setTyping(false)
            setModel(id)
          }}
        />
      )}
      <label className={`block text-xs font-medium ${current.gateway || (listed.length > 0 && !typing && listed.some((m) => m.id === (model || current.model))) ? 'hidden' : ''}`}>
        {listed.length > 0 ? t('maymun.models.typed') : t('maymun.model')}
        <input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder={current.model || t('maymun.modelNeeded')}
          spellCheck={false}
          list={offered.length ? `models-${current.id}` : undefined}
          className={`${field} mt-1 font-mono`}
        />
      </label>
      {offered.length > 0 && !current.gateway && (
        <>
          <datalist id={`models-${current.id}`}>
            {offered.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
          <p className="text-xs text-muted">
            {t('maymun.models')}:{' '}
            {offered.slice(0, 12).map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <button type="button" onClick={() => setModel(id)} className="font-mono underline hover:text-fg">
                  {id}
                </button>
              </span>
            ))}
          </p>
        </>
      )}
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

/**
 * A gateway's models grouped by the connection they come through (OmniRoute: Claude, Gemini, Codex…). The learner turns
 * on the ones Maymun may use; the best active one answers and the next takes over when it fails.
 */
function GatewayModels({ id, offered }: { id: ProviderId; offered: string[] }) {
  const { t } = useI18n()
  const ai = useMaymunAi()
  const active = ai.active[id] ?? []
  const order = rankModels(active)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const set = (next: string[]) => aiStore.set((value) => ({ ...value, active: { ...value.active, [id]: [...new Set(next)] } }))
  const toggle = (model: string) => set(active.includes(model) ? active.filter((m) => m !== model) : [...active, model])
  if (!offered.length) return <p className="rounded-lg border border-border p-2 text-xs text-muted">{t('maymun.gateway.none')}</p>
  return (
    <div className="space-y-2 rounded-lg border border-border p-2 text-xs">
      <p className="font-medium">{t('maymun.gateway.title')}</p>
      <p className="text-muted">
        {order.length ? t('maymun.gateway.order', { models: order.slice(0, 4).join(' → ') }) : t('maymun.gateway.pick')}
      </p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('maymun.gateway.search')}
        aria-label={t('maymun.gateway.search')}
        className="h-8 w-full rounded-md border border-border bg-surface px-2"
      />
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {groupModels(offered)
          .map(({ group, models }) => ({ group, models: models.filter((m) => !q || m.toLowerCase().includes(q) || group.toLowerCase().includes(q)) }))
          .filter(({ models }) => models.length)
          .map(({ group, models }) => {
            const all = models.every((m) => active.includes(m))
            return (
              <fieldset key={group} className="rounded-md bg-surface-2 p-2">
                <legend className="flex w-full items-center gap-2 font-semibold">
                  <span className="flex-1">{group}</span>
                  <button
                    type="button"
                    onClick={() => set(all ? active.filter((m) => !models.includes(m)) : [...active, ...models])}
                    className="font-normal text-accent underline"
                  >
                    {all ? t('maymun.gateway.none-in-group') : t('maymun.gateway.all')}
                  </button>
                </legend>
                {models.map((model) => (
                  <label key={model} className="flex items-center gap-2 py-0.5">
                    <input type="checkbox" checked={active.includes(model)} onChange={() => toggle(model)} className="size-3.5 accent-[var(--accent)]" />
                    <span className="flex-1 truncate font-mono">{model}</span>
                    {active.includes(model) && <span className="text-muted tabular-nums">#{order.indexOf(model) + 1}</span>}
                  </label>
                ))}
              </fieldset>
            )
          })}
      </div>
    </div>
  )
}

/**
 * A server on this computer (OmniRoute, Ollama, LM Studio): the browser asks before a website may reach it, and a phone
 * cannot reach it at all (its localhost is the phone itself), so say both where the service is chosen.
 */
function LocalNote() {
  const { t } = useI18n()
  const touch = useMediaQuery('(pointer: coarse)')
  return (
    <p role="note" className={`text-xs ${touch ? 'rounded-lg border border-danger/40 bg-danger/10 px-3 py-2' : 'text-muted'}`}>
      {touch ? t('maymun.local.phone') : t('maymun.local.permission')}
    </p>
  )
}

const OTHER = '\u0000other'

/** The service's models as a list: free ones in their own group first (with a note on their daily limit), then the rest. */
function ModelPicker({ models, value, onChange }: { models: OfferedModel[]; value: string; onChange: (id: string) => void }) {
  const { t } = useI18n()
  const free = models.filter((m) => m.free)
  const paid = models.filter((m) => !m.free)
  const known = models.some((m) => m.id === value)
  const label = (id: string) => (id === 'openrouter/free' ? t('maymun.models.anyFree') : id === 'openrouter/auto' ? t('maymun.models.auto') : id)
  return (
    <label className="block text-xs font-medium">
      {t('maymun.model')}
      <select
        value={known ? value : OTHER}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 font-mono text-sm"
      >
        {free.length > 0 && (
          <optgroup label={t('maymun.models.free')}>
            {free.map((m) => (
              <option key={m.id} value={m.id}>
                {label(m.id)}
              </option>
            ))}
          </optgroup>
        )}
        {paid.length > 0 && (
          <optgroup label={free.length > 0 ? t('maymun.models.paid') : t('maymun.models.all')}>
            {paid.map((m) => (
              <option key={m.id} value={m.id}>
                {label(m.id)}
              </option>
            ))}
          </optgroup>
        )}
        <option value={OTHER}>{t('maymun.models.other')}</option>
      </select>
      {free.some((m) => m.id === value) && <span className="mt-1 block font-normal text-muted">{t('maymun.models.freeHint')}</span>}
    </label>
  )
}
