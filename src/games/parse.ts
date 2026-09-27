import { ContentError, chunks, splitFrontmatter, splitSections } from '../content/parse.ts'
import type { LocalizedText } from '../content/schema.ts'
import { stepFrontmatterSchema, type GameStep, type GameStepTest } from './schema.ts'

const stepSections = [
  'explanation',
  'explanation-tr',
  'task',
  'task-tr',
  'tests',
  'seed',
  'solution',
] as const

function localized(source: string, name: string, en: string | undefined, tr: string | undefined): LocalizedText {
  if (!en) throw new ContentError(source, `"# --${name}--" is empty or missing`)
  return tr ? { en, tr } : { en }
}

/**
 * Test texts are bilingual: the English requirement, then an optional line starting with `tr:`.
 *
 *     The snake should move right.
 *     tr: Yılan sağa gitmeli.
 *     ```js
 *     ...
 *     ```
 */
function parseTests(source: string, body: string | undefined): GameStepTest[] {
  if (!body) throw new ContentError(source, '"# --tests--" is empty or missing')
  const tests: GameStepTest[] = []
  let pending: LocalizedText | null = null
  for (const chunk of chunks(body)) {
    if (chunk.kind === 'text') {
      if (pending) throw new ContentError(source, `test "${pending.en}" has no code block`)
      const lines = chunk.text.split('\n')
      const trIndex = lines.findIndex((l) => l.startsWith('tr:'))
      const en = (trIndex === -1 ? lines : lines.slice(0, trIndex)).join('\n').trim()
      const tr = trIndex === -1 ? undefined : lines.slice(trIndex).join('\n').slice(3).trim()
      if (!en) throw new ContentError(source, 'test text needs an English line before "tr:"')
      pending = tr ? { en, tr } : { en }
    } else {
      if (!pending) throw new ContentError(source, 'test code block without a text above it')
      tests.push({ text: pending, code: chunk.code })
      pending = null
    }
  }
  if (pending) throw new ContentError(source, `test "${pending.en}" has no code block`)
  return tests
}

function singleJs(source: string, name: string, body: string | undefined): string | undefined {
  if (body === undefined) return undefined
  const blocks = chunks(body)
  if (blocks.length !== 1 || blocks[0].kind !== 'code' || blocks[0].lang !== 'js') {
    throw new ContentError(source, `"# --${name}--" must be exactly one \`\`\`js code block`)
  }
  const code = blocks[0].code
  return code.endsWith('\n') ? code : `${code}\n`
}

export function parseGameStep(source: string, id: string, raw: string): GameStep {
  const { data, body } = splitFrontmatter(source, raw)
  const frontmatter = stepFrontmatterSchema.safeParse(data)
  if (!frontmatter.success) {
    const issues = frontmatter.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    throw new ContentError(source, `invalid frontmatter — ${issues.join('; ')}`)
  }
  const sections = splitSections(source, body, stepSections)
  const { title, title_tr, skills } = frontmatter.data
  const solution = singleJs(source, 'solution', sections.get('solution'))
  if (!solution) throw new ContentError(source, '"# --solution--" is missing')
  return {
    id,
    source,
    title: title_tr ? { en: title, tr: title_tr } : { en: title },
    skills,
    explanation: localized(source, 'explanation', sections.get('explanation'), sections.get('explanation-tr')),
    task: localized(source, 'task', sections.get('task'), sections.get('task-tr')),
    tests: parseTests(source, sections.get('tests')),
    seed: singleJs(source, 'seed', sections.get('seed')),
    solution,
  }
}
