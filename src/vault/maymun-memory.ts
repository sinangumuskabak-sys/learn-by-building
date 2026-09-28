import { readSections, writeSection } from './sections.ts'

/**
 * How Maymun reads and fills the memory vault. With each question it gets the notes that matter for it (the
 * overview, the learner profile, the project's and step's notes, the step's skills) and the list of sections it may
 * write. It ends its answer with a hidden block:
 *
 *     <memory>[{"file": "Oyunlar/Yılan/Adımlar/03 ….md", "section": "struggled", "add": "…"}]</memory>
 *
 * The app hides the block, checks every operation (a known note, a `maymun:` section, short, no secrets) and writes the
 * ones that pass. A broken block writes nothing; the answer is shown either way.
 */

export interface NoteText {
  path: string
  content: string
}

export interface MemoryOp {
  file: string
  section: string
  /** Adds a bullet to the section (skipped when the same line is already there). */
  add?: string
  /** Replaces the section: only for the "current" kind of section (see SETTABLE). */
  set?: string
}

/** Sections that describe the present, so they are replaced rather than added to. */
export const SETTABLE = new Set(['now', 'next', 'level', 'strengths', 'weaknesses', 'style', 'definition', 'model', 'review', 'summary'])
const MAX_OPS = 6
const MAX_ADD = 300
const MAX_SET = 800
/** Budget for the notes that go with a question (characters, about 3,000 tokens). */
const MAX_BLOCK = 11_000
const MAX_NOTE = 3_000
/** Looks like a key, a password or a token: never written into the vault. */
const SECRET = /\b(sk-[\w-]{6,}|sk-ant-[\w-]+|AKIA[0-9A-Z]{12,}|ghp_\w{10,})|api[_ -]?key\s*[:=]|password\s*[:=]|şifre(m|n)?\s*[:=]/i

const OPEN = '<memory>'
const CLOSE = '</memory>'

/** The part of an answer to show while it streams: everything before the memory block (or a half-typed opening). */
export function visibleText(text: string): string {
  const at = text.indexOf(OPEN)
  if (at >= 0) return text.slice(0, at).trimEnd()
  for (let n = OPEN.length - 1; n > 0; n--) {
    if (text.endsWith(OPEN.slice(0, n))) return text.slice(0, text.length - n)
  }
  return text
}

/** Splits a finished answer into what the learner sees and the operations of its memory block. */
export function parseMemory(text: string): { visible: string; ops: MemoryOp[] } {
  const at = text.lastIndexOf(OPEN)
  if (at < 0) return { visible: text.trim(), ops: [] }
  const end = text.indexOf(CLOSE, at)
  const raw = text.slice(at + OPEN.length, end < 0 ? undefined : end).trim()
  const visible = text.slice(0, at).trim()
  try {
    const parsed: unknown = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ''))
    const list = Array.isArray(parsed) ? parsed : []
    const ops = list
      .filter((op): op is MemoryOp => !!op && typeof op === 'object' && typeof op.file === 'string' && typeof op.section === 'string')
      .map((op) => ({ file: op.file, section: op.section, ...(typeof op.add === 'string' ? { add: op.add } : {}), ...(typeof op.set === 'string' ? { set: op.set } : {}) }))
      .filter((op) => op.add !== undefined || op.set !== undefined)
    return { visible, ops }
  } catch {
    return { visible, ops: [] }
  }
}

export interface Applied {
  path: string
  content: string
}

/**
 * The notes changed by a memory block; operations outside `allowed` paths, on sections that are not Maymun's, too
 * long, or looking like secrets are skipped.
 */
export function applyOps(ops: MemoryOp[], notes: Map<string, string>, allowed: ReadonlySet<string>, emptyMark: RegExp): Applied[] {
  const changed = new Map<string, string>()
  for (const op of ops.slice(0, MAX_OPS)) {
    if (!allowed.has(op.file)) continue
    const content = changed.get(op.file) ?? notes.get(op.file)
    if (content === undefined) continue
    const section = readSections(content).find((s) => s.owner === 'maymun' && s.id === op.section)
    if (!section) continue
    const text = (op.set ?? op.add ?? '').trim()
    if (!text || SECRET.test(text)) continue
    if (op.set !== undefined) {
      if (!SETTABLE.has(op.section) || text.length > MAX_SET) continue
      changed.set(op.file, writeSection(content, 'maymun', op.section, text))
      continue
    }
    if (text.length > MAX_ADD) continue
    const line = `- ${text.replace(/^[-*]\s+/, '').replace(/\s*\n\s*/g, ' ')}`
    const lines = section.body.split('\n').filter((l) => l.trim() && !emptyMark.test(l.trim()))
    if (lines.some((l) => l.trim().toLowerCase() === line.toLowerCase())) continue
    changed.set(op.file, writeSection(content, 'maymun', op.section, [...lines, line].join('\n')))
  }
  return [...changed.entries()].map(([path, content]) => ({ path, content }))
}

/** A note as it goes to the model: without its front matter, clipped. */
function forModel(content: string) {
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim()
  return body.length > MAX_NOTE ? `${body.slice(0, MAX_NOTE)}\n…` : body
}

/**
 * The memory part of the system prompt: how to keep the vault, the notes that matter now, and where Maymun may
 * write. `notes` come most important first; the budget cuts from the end.
 */
export function memoryPrompt(notes: NoteText[], instructions: string): { text: string; allowed: Set<string> } {
  const allowed = new Set<string>()
  const blocks: string[] = []
  const writable: string[] = []
  let used = 0
  for (const note of notes) {
    const text = forModel(note.content)
    if (used + text.length > MAX_BLOCK) break
    used += text.length
    blocks.push(`<note path="${note.path}">\n${text}\n</note>`)
    const sections = readSections(note.content).filter((s) => s.owner === 'maymun')
    if (sections.length) {
      allowed.add(note.path)
      writable.push(`- ${note.path}: ${sections.map((s) => `${s.id}${SETTABLE.has(s.id) ? ' (set)' : ' (add)'}`).join(', ')}`)
    }
  }
  const text = [
    '# Memory vault',
    '',
    'You keep this learner\'s memory in a vault of Markdown notes; the notes below come back to you in later',
    'conversations. Their instructions for you (the learner can read them too):',
    '',
    instructions.trim(),
    '',
    '## How to write to the vault',
    '',
    'After your answer, add one block on its own, exactly like this (the learner never sees it):',
    '',
    '<memory>[{"file": "<path>", "section": "<id>", "add": "<one sentence>"}, {"file": "<path>", "section": "<id>", "set": "<the new text>"}]</memory>',
    '',
    `- At most ${MAX_OPS} operations; "add" appends one bullet (max ${MAX_ADD} characters), "set" replaces a section`,
    '  marked (set) below (keep it short, a few lines).',
    '- Only the files and sections listed here. Write in the learner\'s interface language.',
    '- Nothing worth keeping from this exchange? Write <memory>[]</memory>.',
    '',
    'You may write to:',
    ...writable,
    '',
    '## The notes that matter now',
    '',
    ...blocks,
  ].join('\n')
  return { text, allowed }
}
