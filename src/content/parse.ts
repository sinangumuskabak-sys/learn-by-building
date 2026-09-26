import { parse as parseYaml } from 'yaml'
import {
  frontmatterSchema,
  type Challenge,
  type CodeFile,
  type QuizQuestion,
  type TestCase,
} from './schema.ts'

export class ContentError extends Error {
  readonly source: string

  constructor(source: string, message: string) {
    super(`${source}: ${message}`)
    this.name = 'ContentError'
    this.source = source
  }
}

const SECTION = /^# --([a-z]+)--\s*$/
const knownSections = [
  'description',
  'instructions',
  'hints',
  'setup',
  'seed',
  'solutions',
  'questions',
  'rubric',
] as const
type SectionName = (typeof knownSections)[number]

const defaultFileNames: Record<string, string> = {
  js: 'index.js',
  ts: 'index.ts',
  html: 'index.html',
  css: 'styles.css',
  sql: 'query.sql',
}

/** A piece of a section body: either prose or a fenced code block. */
type Chunk = { kind: 'text'; text: string } | { kind: 'code'; lang: string; meta: string; code: string }

function splitFrontmatter(source: string, raw: string): { data: unknown; body: string } {
  const text = raw.replace(/\r\n/g, '\n')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (!match) throw new ContentError(source, 'missing frontmatter block (--- ... ---) at the top')
  try {
    return { data: parseYaml(match[1]), body: text.slice(match[0].length) }
  } catch (error) {
    throw new ContentError(source, `invalid frontmatter YAML: ${(error as Error).message}`)
  }
}

function splitSections(source: string, body: string): Map<SectionName, string> {
  const sections = new Map<SectionName, string>()
  let current: SectionName | null = null
  let buffer: string[] = []
  let fence: string | null = null

  const flush = () => {
    if (current) sections.set(current, buffer.join('\n').trim())
  }

  for (const line of body.split('\n')) {
    // Headings inside code blocks are code, not section markers.
    const fenceMatch = /^(`{3,})/.exec(line)
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1]
      else if (line.trim() === fence) fence = null
    }
    const heading = fence === null ? SECTION.exec(line) : null
    if (heading) {
      const name = heading[1] as SectionName
      if (!knownSections.includes(name)) throw new ContentError(source, `unknown section "# --${name}--"`)
      if (sections.has(name) || current === name) throw new ContentError(source, `duplicate section "# --${name}--"`)
      flush()
      current = name
      buffer = []
    } else if (current) {
      buffer.push(line)
    } else if (line.trim() !== '') {
      throw new ContentError(source, 'content before the first "# --section--" heading')
    }
  }
  if (fence !== null) throw new ContentError(source, 'unclosed code fence')
  flush()
  return sections
}

function chunks(body: string): Chunk[] {
  const result: Chunk[] = []
  const lines = body.split('\n')
  let text: string[] = []

  const pushText = () => {
    const joined = text.join('\n').trim()
    if (joined) result.push({ kind: 'text', text: joined })
    text = []
  }

  for (let i = 0; i < lines.length; i++) {
    const open = /^(`{3,})(\S*)\s*(.*)$/.exec(lines[i])
    if (!open) {
      text.push(lines[i])
      continue
    }
    pushText()
    const code: string[] = []
    i++
    while (i < lines.length && lines[i].trim() !== open[1]) code.push(lines[i++])
    result.push({ kind: 'code', lang: open[2], meta: open[3], code: code.join('\n') })
  }
  pushText()
  return result
}

function toFile(source: string, chunk: Extract<Chunk, { kind: 'code' }>): CodeFile {
  const named = /(?:^|\s)file=(\S+)/.exec(chunk.meta)
  const name = named?.[1] ?? defaultFileNames[chunk.lang]
  if (!chunk.lang) throw new ContentError(source, 'code block needs a language, e.g. ```js')
  if (!name) throw new ContentError(source, `no default file name for "${chunk.lang}"; add file=<name>`)
  return { name, lang: chunk.lang, contents: chunk.code.endsWith('\n') ? chunk.code : `${chunk.code}\n` }
}

function codeFiles(source: string, section: string, body: string | undefined): CodeFile[] {
  if (!body) return []
  const files: CodeFile[] = []
  for (const chunk of chunks(body)) {
    if (chunk.kind === 'text') throw new ContentError(source, `only code blocks are allowed in "# --${section}--"`)
    const file = toFile(source, chunk)
    if (files.some((f) => f.name === file.name)) {
      throw new ContentError(source, `duplicate file "${file.name}" in "# --${section}--"`)
    }
    files.push(file)
  }
  return files
}

function parseTests(source: string, body: string | undefined): TestCase[] {
  if (!body) return []
  const tests: TestCase[] = []
  let pending: string | null = null
  for (const chunk of chunks(body)) {
    if (chunk.kind === 'text') {
      if (pending !== null) throw new ContentError(source, `hint "${pending}" has no test code block`)
      pending = chunk.text
    } else {
      if (pending === null) throw new ContentError(source, 'test code block without a hint text above it')
      tests.push({ text: pending, code: chunk.code })
      pending = null
    }
  }
  if (pending !== null) throw new ContentError(source, `hint "${pending}" has no test code block`)
  return tests
}

function parseSolutions(source: string, body: string | undefined): CodeFile[][] {
  if (!body) return []
  // Alternative solutions are separated by a line containing only "---".
  return body
    .split(/^---$/m)
    .map((part, index) => codeFiles(source, `solutions #${index + 1}`, part.trim()))
    .filter((files) => files.length > 0)
}

function parseQuestions(source: string, body: string | undefined): QuizQuestion[] {
  if (!body) return []
  const questions: QuizQuestion[] = []
  for (const line of body.split('\n')) {
    const prompt = /^## (.+)$/.exec(line)
    const option = /^- \[( |x)\] (.+)$/.exec(line)
    if (prompt) {
      questions.push({ prompt: prompt[1].trim(), options: [] })
    } else if (option) {
      const current = questions.at(-1)
      if (!current) throw new ContentError(source, 'quiz option before any "## question"')
      current.options.push({ text: option[2].trim(), correct: option[1] === 'x' })
    } else if (line.trim() !== '') {
      throw new ContentError(source, `unexpected line in "# --questions--": ${line}`)
    }
  }
  return questions
}

function parseRubric(source: string, body: string | undefined): string[] {
  if (!body) return []
  return body
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const item = /^- (.+)$/.exec(line)
      if (!item) throw new ContentError(source, `rubric lines must be "- criterion", got: ${line}`)
      return item[1].trim()
    })
}

/** Parses one challenge file. Structural errors throw; per-type completeness is checked by `validateChallenge`. */
export function parseChallenge(source: string, raw: string): Challenge {
  const { data, body } = splitFrontmatter(source, raw)
  const frontmatter = frontmatterSchema.safeParse(data)
  if (!frontmatter.success) {
    const issues = frontmatter.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    throw new ContentError(source, `invalid frontmatter — ${issues.join('; ')}`)
  }
  const sections = splitSections(source, body)
  return {
    ...frontmatter.data,
    source,
    description: sections.get('description') ?? '',
    instructions: sections.get('instructions') ?? '',
    tests: parseTests(source, sections.get('hints')),
    setup: codeFiles(source, 'setup', sections.get('setup')),
    seed: codeFiles(source, 'seed', sections.get('seed')),
    solutions: parseSolutions(source, sections.get('solutions')),
    questions: parseQuestions(source, sections.get('questions')),
    rubric: parseRubric(source, sections.get('rubric')),
  }
}
