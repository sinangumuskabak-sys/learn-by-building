import { ContentError, chunks, splitFrontmatter, splitSections } from '../content/parse.ts'
import type { LocalizedText } from '../content/schema.ts'
import { stepFrontmatterSchema, type GameStep, type GameStepTest } from './schema.ts'

const stepSections = [
  'explanation',
  'explanation-tr',
  'goal',
  'goal-tr',
  'code',
  'meaning',
  'meaning-tr',
  'task',
  'task-tr',
  'predict',
  'predict-tr',
  'hint',
  'hint-tr',
  'try',
  'try-tr',
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

function optional(source: string, name: string, en: string | undefined, tr: string | undefined): LocalizedText | undefined {
  return en === undefined && tr === undefined ? undefined : localized(source, name, en, tr)
}

function singleCode(source: string, name: string, body: string | undefined, lang: string): string | undefined {
  if (body === undefined) return undefined
  const blocks = chunks(body)
  if (blocks.length !== 1 || blocks[0].kind !== 'code' || blocks[0].lang !== lang) {
    throw new ContentError(source, `"# --${name}--" must be exactly one \`\`\`${lang} code block`)
  }
  const code = blocks[0].code
  return code.endsWith('\n') ? code : `${code}\n`
}

/** `lang` is the project's language (`js` for games, `html` for web projects); seed and solution are written in it. */
/** The code to write: one code block in any language, kept with its fence so it renders highlighted. */
function codeBlock(source: string, body: string | undefined): string | undefined {
  if (body === undefined) return undefined
  const blocks = chunks(body)
  if (blocks.length !== 1 || blocks[0].kind !== 'code') throw new ContentError(source, '"# --code--" must be exactly one code block')
  return body.trim()
}

export function parseGameStep(source: string, id: string, raw: string, lang = 'js'): GameStep {
  const { data, body } = splitFrontmatter(source, raw)
  const frontmatter = stepFrontmatterSchema.safeParse(data)
  if (!frontmatter.success) {
    const issues = frontmatter.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    throw new ContentError(source, `invalid frontmatter — ${issues.join('; ')}`)
  }
  const sections = splitSections(source, body, stepSections)
  const { title, title_tr, skills } = frontmatter.data
  const solution = singleCode(source, 'solution', sections.get('solution'), lang)
  if (!solution) throw new ContentError(source, '"# --solution--" is missing')
  return {
    id,
    source,
    title: title_tr ? { en: title, tr: title_tr } : { en: title },
    skills,
    explanation: optional(source, 'explanation', sections.get('explanation'), sections.get('explanation-tr')),
    goal: optional(source, 'goal', sections.get('goal'), sections.get('goal-tr')),
    code: codeBlock(source, sections.get('code')),
    meaning: optional(source, 'meaning', sections.get('meaning'), sections.get('meaning-tr')),
    task: localized(source, 'task', sections.get('task'), sections.get('task-tr')),
    predict: optional(source, 'predict', sections.get('predict'), sections.get('predict-tr')),
    hint: optional(source, 'hint', sections.get('hint'), sections.get('hint-tr')),
    try: optional(source, 'try', sections.get('try'), sections.get('try-tr')),
    tests: parseTests(source, sections.get('tests')),
    seed: singleCode(source, 'seed', sections.get('seed'), lang),
    solution,
  }
}
