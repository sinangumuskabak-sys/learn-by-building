import { streamChatWithFallback } from './ai.ts'
import { getTimeline, newChat, saveSummary, type Timeline } from './memory.ts'
import { aiStore, baseFor, isReady, modelFor, modelsFor } from './store.ts'
import { pageForModel, windowStart } from './window.ts'

/**
 * The running summary (Claude's compaction, OpenAI's summarizing session): pages that have left the window are folded
 * into one short summary, a few at a time, in the background after an answer; each gets a one-line title for the
 * index in the same call. A failed call changes nothing (the old summary stays, the pages can still be recalled).
 */

/** After this long away the model gets a clean window (the summary, the index and recall stay). */
export const LONG_GAP = 4 * 60 * 60 * 1000
/** Pages folded in one call. */
const PER_CALL = 4
const MAX_SUMMARY = 1_500

const INSTRUCTIONS = `You keep the running summary of a long tutoring conversation between a learner and Maymun, their
coding tutor. You get the summary so far and the next pages of the conversation. Reply with JSON only:
{"summary": "...", "titles": {"<page number>": "..."}}
- summary: the new summary, the old one with these pages worked in, in Markdown with these parts:
  **Now:** what the learner is working on and where they stand.
  **Decisions and preferences:** what was agreed, how they like explanations.
  **Open questions:** asked but not settled yet.
  **About the learner:** what they understand, where they struggle.
  Newer pages win over older ones: drop what is no longer true. Mark what you are unsure of with "(?)". At most
  ${MAX_SUMMARY} characters. No code, no secrets.
- titles: for every page given, one short line on what it is about (at most 80 characters).
Write in the language given below.`

/** Reads the model's reply; null when it is not the expected JSON. */
export function parseFold(text: string): { summary: string; titles: Record<number, string> } | null {
  const json = /\{[\s\S]*\}/.exec(text)?.[0]
  if (!json) return null
  try {
    const raw = JSON.parse(json) as { summary?: unknown; titles?: unknown }
    if (typeof raw.summary !== 'string' || !raw.summary.trim()) return null
    const titles: Record<number, string> = {}
    for (const [n, title] of Object.entries(raw.titles && typeof raw.titles === 'object' ? raw.titles : {})) {
      if (/^\d+$/.test(n) && typeof title === 'string' && title.trim()) titles[+n] = title.trim().slice(0, 100)
    }
    return { summary: raw.summary.trim().slice(0, MAX_SUMMARY * 1.5), titles }
  } catch {
    return null
  }
}

/** The pages waiting to be folded: wholly before the window, after the last folded one. */
export function pendingPages(timeline: Timeline) {
  const from = windowStart(timeline)
  let at = 0
  const whole = timeline.pages.filter((page) => {
    at += page.messages.length
    return at <= from
  })
  return whole.filter((p) => p.n > timeline.foldedThrough).slice(0, PER_CALL)
}

let running = false

/** Folds the next waiting pages into the summary, if any and if Maymun can be asked; one call at a time. */
export async function fold(language: string, rounds = 3): Promise<void> {
  const ai = aiStore.get()
  const timeline = getTimeline()
  const pages = pendingPages(timeline)
  if (running || !pages.length || !isReady(ai)) return
  running = true
  let text = ''
  let ok = false
  try {
    await streamChatWithFallback({
      provider: ai.provider,
      key: ai.keys[ai.provider] ?? '',
      base: baseFor(ai, ai.provider),
      model: modelFor(ai, ai.provider),
      system: `${INSTRUCTIONS}\nLanguage: ${language}.`,
      messages: [{ role: 'user', text: `The summary so far:\n\n${timeline.summary || '(none yet)'}\n\nThe next pages:\n\n${pages.map(pageForModel).join('\n\n')}` }],
      onText: (piece) => {
        text += piece
      },
    }, modelsFor(ai, ai.provider))
    const result = parseFold(text)
    // A page deleted meanwhile (the summary started over): this result may carry it, drop it.
    const now = getTimeline()
    if (!result || now.summary !== timeline.summary || now.foldedThrough !== timeline.foldedThrough || pages.some((p) => !now.pages.some((q) => q.n === p.n))) return
    saveSummary(result.summary, pages.at(-1)!.n, result.titles)
    ok = true
  } catch {
    // The pages stay waiting; the next answer tries again.
  } finally {
    running = false
  }
  // A backlog (a long break, the conversations of an older version): a few more calls, not all at once.
  if (ok && rounds > 1) await fold(language, rounds - 1)
}

/** Coming back after a long break: a clean window, and the summary brought up to date. */
export function startOverAfterBreak(now = Date.now()): boolean {
  const timeline = getTimeline()
  const last = timeline.messages.at(-1)
  if (!last?.at || now - last.at < LONG_GAP || timeline.windowFrom >= timeline.messages.length) return false
  newChat()
  return true
}

