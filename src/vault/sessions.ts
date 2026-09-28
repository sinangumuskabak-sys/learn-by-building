import type { Lang } from '../i18n/messages.ts'
import { streamChat } from '../maymun/ai.ts'
import { forModel, type StoredMessage } from '../maymun/memory.ts'
import { aiStore, baseFor, isReady, modelFor } from '../maymun/store.ts'
import { safeName } from './skeleton.ts'
import { marker, writeFrontMatter, writeSection } from './sections.ts'

/**
 * Session summaries: when the learner comes back to a project after a break (or starts a new topic), the previous
 * session is summed up in one short call and kept as a note next to the project's status, like claude-mem's
 * "asked / learned / done / next".
 */

/** A session ends after this long without a message. */
export const SESSION_GAP = 30 * 60 * 1000

export interface Summary {
  asked: string[]
  learned: string[]
  hard: string[]
  done: string[]
  next: string
}

const words = {
  tr: { sessions: 'Oturumlar', asked: 'Sorulanlar', learned: 'Öğrenilenler', hard: 'Zorlanılanlar', done: 'Yapılanlar', next: 'Sıradaki', none: '_(yok)_' },
  en: { sessions: 'Sessions', asked: 'Asked', learned: 'Learned', hard: 'Was hard', done: 'Done', next: 'Next', none: '_(none)_' },
}

const INSTRUCTIONS = `You sum up a finished tutoring session for the learner's memory vault. Reply with JSON only:
{"asked": ["..."], "learned": ["..."], "hard": ["..."], "done": ["..."], "next": "..."}
- asked: the learner's questions, one line each (their gist, not the wording).
- learned: what the learner showed they understood.
- hard: where they got stuck and why.
- done: what they built or finished.
- next: one sentence, what they should do next time.
At most 5 items per list, one short sentence each, in the language given below. No code, no secrets.`

/** Reads the model's summary; null when it is not the expected JSON. */
export function parseSummary(text: string): Summary | null {
  const json = /\{[\s\S]*\}/.exec(text)?.[0]
  if (!json) return null
  try {
    const raw = JSON.parse(json) as Partial<Record<keyof Summary, unknown>>
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()).slice(0, 5) : [])
    const summary = { asked: list(raw.asked), learned: list(raw.learned), hard: list(raw.hard), done: list(raw.done), next: typeof raw.next === 'string' ? raw.next.trim() : '' }
    return summary.asked.length + summary.learned.length + summary.hard.length + summary.done.length || summary.next ? summary : null
  } catch {
    return null
  }
}

const stamp = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`

/** The session note: where it goes (next to the project's status note) and what it says. */
export function sessionNote(projectNote: string, projectTitle: string, summary: Summary, ended: Date, lang: Lang) {
  const w = words[lang]
  const dir = projectNote.split('/').slice(0, -1).join('/')
  const name = `${stamp(ended)}${projectNote.endsWith(`/${lang === 'tr' ? 'Güncel durum' : 'Current status'}.md`) ? '' : ` ${safeName(projectTitle)}`}`
  const path = `${dir}/${w.sessions}/${name}.md`
  const bullets = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join('\n') : w.none)
  const content = writeFrontMatter(
    [
      `# ${projectTitle} · ${stamp(ended)}`,
      '',
      `## ${w.asked}`,
      bullets(summary.asked),
      '',
      `## ${w.learned}`,
      bullets(summary.learned),
      '',
      `## ${w.hard}`,
      bullets(summary.hard),
      '',
      `## ${w.done}`,
      bullets(summary.done),
      '',
      `## ${w.next}`,
      summary.next || w.none,
      '',
    ].join('\n'),
    ['type: session', `project: "[[${projectNote.replace(/\.md$/, '')}]]"`, `ended: ${ended.toISOString()}`].join('\n'),
  )
  return { path, content }
}

/** The project's status note with its list of sessions (newest first) brought up to date. */
export function withSessionList(statusNote: string, sessionPaths: string[]): string {
  if (!statusNote.includes(marker('auto', 'sessions'))) return statusNote
  const list = [...sessionPaths]
    .sort()
    .reverse()
    .map((p) => `- [[${p.replace(/\.md$/, '')}|${p.split('/').at(-1)!.replace(/\.md$/, '')}]]`)
    .join('\n')
  return writeSection(statusNote, 'auto', 'sessions', list)
}

/** Asks the learner's AI for a summary of the messages; null when there is no AI or it fails. */
export async function summarize(messages: StoredMessage[], language: string): Promise<Summary | null> {
  const ai = aiStore.get()
  if (!isReady(ai) || messages.length < 2) return null
  const transcript = forModel(messages)
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Maymun'}: ${m.text}`)
    .join('\n\n')
  let text = ''
  try {
    await streamChat({
      provider: ai.provider,
      key: ai.keys[ai.provider] ?? '',
      base: baseFor(ai, ai.provider),
      model: modelFor(ai, ai.provider),
      system: `${INSTRUCTIONS}\nLanguage: ${language}.`,
      messages: [{ role: 'user', text: `The session:\n\n${transcript}` }],
      onText: (piece) => {
        text += piece
      },
    })
  } catch {
    return null
  }
  return parseSummary(text)
}
