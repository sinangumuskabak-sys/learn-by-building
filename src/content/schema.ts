import { z } from 'zod'

/** Every challenge belongs to one of these kinds; the kind decides which runner and editor it gets. */
export const challengeTypes = ['code-js', 'code-ts', 'web', 'sql', 'quiz', 'read', 'design'] as const
export type ChallengeType = (typeof challengeTypes)[number]

/** Types whose tests run automatically and therefore need seed code, tests and a reference solution. */
export const runnableTypes: readonly ChallengeType[] = ['code-js', 'code-ts', 'web', 'sql']

export const MIN_LEVEL = 0
export const MAX_LEVEL = 8

const id = z.string().regex(/^[a-z0-9]+(?:[-.][a-z0-9]+)*$/, 'use lowercase letters, digits, "-" or "."')

/** Text shown in the UI; English is required, Turkish is optional and falls back to English. */
export const localizedText = z.object({ en: z.string().min(1), tr: z.string().min(1).optional() })
export type LocalizedText = z.infer<typeof localizedText>

export const frontmatterSchema = z.object({
  id,
  title: z.string().min(1),
  /** Turkish title; the other Turkish texts live in `-tr` sections next to their English ones. */
  title_tr: z.string().min(1).optional(),
  type: z.enum(challengeTypes),
  skills: z.array(id).min(1),
  level: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  lang: z.enum(['en', 'tr']).default('en'),
})
export type Frontmatter = z.infer<typeof frontmatterSchema>

export const skillSchema = z.object({ id, title: localizedText, category: id })
export const skillsFileSchema = z.array(skillSchema)
export type Skill = z.infer<typeof skillSchema>

export const moduleSchema = z.object({
  id,
  title: localizedText,
  description: localizedText.optional(),
  challenges: z.array(id),
})
export const categorySchema = z.object({
  id,
  title: localizedText,
  description: localizedText,
  icon: z.string().min(1),
  modules: z.array(moduleSchema),
})
export const curriculumSchema = z.object({ categories: z.array(categorySchema).min(1) })
export type CurriculumModule = z.infer<typeof moduleSchema>
export type Category = z.infer<typeof categorySchema>
export type Curriculum = z.infer<typeof curriculumSchema>

export interface CodeFile {
  /** File name shown on the editor tab, e.g. `index.js`, `query.sql`. */
  name: string
  lang: string
  contents: string
}

export interface TestCase {
  /** What the learner sees, written as a requirement. */
  text: string
  /** Assertion code run by the challenge's runner. */
  code: string
  /** Turkish requirement text (a `tr:` line under the English one). */
  tr?: string
}

export interface QuizQuestion {
  prompt: string
  options: { text: string; correct: boolean }[]
  /** Shown after a wrong answer: a nudge towards the reasoning (a "> " line under the options). */
  hint?: string
}

export interface Challenge extends Frontmatter {
  /** Path relative to the content root; used in error messages. */
  source: string
  description: string
  instructions: string
  tests: TestCase[]
  /** Runs before each test run (SQL schema and data, helper code); hidden from the learner. */
  setup: CodeFile[]
  seed: CodeFile[]
  solutions: CodeFile[][]
  questions: QuizQuestion[]
  rubric: string[]
  /** Turkish texts, each optional; the UI falls back to English (see `localizeChallenge`). */
  tr?: {
    description?: string
    instructions?: string
    /** Same questions in the same order, with translated prompts and options. */
    questions?: QuizQuestion[]
    rubric?: string[]
  }
}
