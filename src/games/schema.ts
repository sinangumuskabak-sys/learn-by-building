import { z } from 'zod'
import { localizedText, type LocalizedText } from '../content/schema.ts'

const id = z.string().regex(/^[a-z0-9]+(?:[-.][a-z0-9]+)*$/, 'use lowercase letters, digits, "-" or "."')

export const difficulties = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof difficulties)[number]

/** `content/games/<id>/game.json` */
export const gameMetaSchema = z.object({
  id,
  /** Position in the game list; easier games come first. */
  order: z.number().int(),
  title: localizedText,
  description: localizedText,
  difficulty: z.enum(difficulties),
  canvas: z.object({
    width: z.number().int().min(100).max(1200),
    height: z.number().int().min(100).max(1200),
  }),
  /** Card accent color. */
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  skills: z.array(id).min(1),
  /** Ideas for taking the finished game further; shown after the last step. */
  extend: z.array(localizedText).default([]),
})
export type GameMeta = z.infer<typeof gameMetaSchema>

export const stepFrontmatterSchema = z.object({
  title: z.string().min(1),
  title_tr: z.string().min(1).optional(),
  skills: z.array(id).default([]),
})

export interface GameStepTest {
  text: LocalizedText
  code: string
}

export interface GameStep {
  /** File name without `.md`, e.g. `03-move`; unique within its game. */
  id: string
  source: string
  title: LocalizedText
  skills: string[]
  /** Why this step matters and the idea behind it (Markdown). */
  explanation: LocalizedText
  /** What to change in the code (Markdown). */
  task: LocalizedText
  tests: GameStepTest[]
  /** Starting code; only the first step has one, later steps start from the previous step's solution. */
  seed?: string
  /** The whole `game.js` after this step. */
  solution: string
}

export interface Game extends GameMeta {
  steps: GameStep[]
}

/** Progress key for one game step, stored alongside challenge progress. */
export const stepKey = (gameId: string, stepId: string) => `game:${gameId}/${stepId}`

/** The code a step starts from when the learner has no saved code of their own. */
export function referenceStart(game: Game, index: number): string {
  return index === 0 ? (game.steps[0].seed ?? '') : game.steps[index - 1].solution
}
