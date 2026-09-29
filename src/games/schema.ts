import { z } from 'zod'
import { localizedText, type LocalizedText } from '../content/schema.ts'

const id = z.string().regex(/^[a-z0-9]+(?:[-.][a-z0-9]+)*$/, 'use lowercase letters, digits, "-" or "."')

export const difficulties = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof difficulties)[number]

/** What a project builds: a canvas game (`game.js`) or a web page (`index.html`) shown live. */
export const gameKinds = ['game', 'web'] as const
export type GameKind = (typeof gameKinds)[number]

/** The single file a project is written in. */
export const projectFile = (kind: GameKind) =>
  kind === 'web' ? { name: 'index.html', lang: 'html' } : { name: 'game.js', lang: 'js' }

/** `content/games/<id>/game.json` */
export const gameMetaSchema = z.object({
  id,
  /** Position in the game list; easier games come first. */
  order: z.number().int(),
  kind: z.enum(gameKinds).default('game'),
  title: localizedText,
  description: localizedText,
  difficulty: z.enum(difficulties),
  /** The game's canvas; web projects leave it out. */
  canvas: z
    .object({
      width: z.number().int().min(100).max(1200),
      height: z.number().int().min(100).max(1200),
    })
    .default({ width: 400, height: 400 }),
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
  /** Why this step matters and the idea behind it (Markdown). Older steps; newer ones use goal, code and meaning. */
  explanation?: LocalizedText
  /** 1. What we are doing in this step and why (Markdown). */
  goal?: LocalizedText
  /** 2. The code the learner will write, shown as it is. */
  code?: string
  /** 3. What the code means, line by line (Markdown). */
  meaning?: LocalizedText
  /** 4. Your turn: where to write it and what to check (Markdown). */
  task: LocalizedText
  /** A guess to make before running: a question and a list of options, the right one marked `- [x]`. */
  predict?: LocalizedText
  /** Shown in the hint box when a check fails (Markdown). */
  hint?: LocalizedText
  /** A small change to try once the step passes; not checked (Markdown). */
  try?: LocalizedText
  tests: GameStepTest[]
  /** Starting code; only the first step has one, later steps start from the previous step's solution. */
  seed?: string
  /** The whole `game.js` after this step. */
  solution: string
}

export interface Game extends GameMeta {
  steps: GameStep[]
}

/** What the games list needs about a step; the full step loads with its game. */
export type GameStepSummary = Pick<GameStep, 'id' | 'title' | 'skills'>

export interface GameSummary extends GameMeta {
  steps: GameStepSummary[]
}

/** Progress key for one game step, stored alongside challenge progress. */
export const stepKey = (gameId: string, stepId: string) => `game:${gameId}/${stepId}`

/** The code a step starts from when the learner has no saved code of their own. */
export function referenceStart(game: Game, index: number): string {
  return index === 0 ? (game.steps[0].seed ?? '') : game.steps[index - 1].solution
}

export interface PredictQuestion {
  question: string
  options: { text: string; correct: boolean; why?: string }[]
}

/**
 * Reads a predict section: the question, then options as a task list; `- [x]` marks the right one. A line indented
 * under an option says why it is right or wrong.
 *
 *     What will the square do?
 *     - [ ] Move left
 *       It moves the other way: x grows.
 *     - [x] Move right
 */
export function parsePredict(source: string): PredictQuestion {
  const question: string[] = []
  const options: PredictQuestion['options'] = []
  for (const line of source.split(/\r?\n/)) {
    const option = /^- \[( |x)\] (.+)$/.exec(line)
    if (option) options.push({ text: option[2].trim(), correct: option[1] === 'x' })
    else if (options.length > 0 && /^\s+\S/.test(line)) {
      const last = options[options.length - 1]
      last.why = `${last.why ? `${last.why} ` : ''}${line.trim()}`
    } else if (options.length === 0) question.push(line)
  }
  return { question: question.join('\n').trim(), options }
}
