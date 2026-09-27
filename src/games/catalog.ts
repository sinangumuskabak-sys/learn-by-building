import content from 'virtual:games'
import type { Progress } from '../progress/progress.ts'
import { referenceStart, stepKey, type Game } from './schema.ts'

// Game content is parsed and validated at build time (see the games plugin in vite.config.ts).
export const games: Game[] = content.games

export function findGame(id: string): Game | undefined {
  return games.find((g) => g.id === id)
}

export function stepPassed(progress: Progress, game: Game, index: number): boolean {
  const step = game.steps[index]
  return !!step && progress.challenges[stepKey(game.id, step.id)]?.status === 'passed'
}

export function passedSteps(progress: Progress, game: Game): number {
  return game.steps.filter((_, index) => stepPassed(progress, game, index)).length
}

/** The step to open when entering a game: the first one not yet passed (or the last one when all are). */
export function resumeStep(progress: Progress, game: Game): number {
  const index = game.steps.findIndex((_, i) => !stepPassed(progress, game, i))
  return index === -1 ? game.steps.length - 1 : index
}

/**
 * The code a step opens with: the learner's own saved code for it, else their code from the previous step (so
 * the game they are building carries over), else the reference starting point.
 */
export function initialCode(progress: Progress, game: Game, index: number): string {
  const own = progress.challenges[stepKey(game.id, game.steps[index].id)]?.files?.[0]?.contents
  if (own !== undefined) return own
  if (index > 0 && stepPassed(progress, game, index - 1)) {
    const previous = progress.challenges[stepKey(game.id, game.steps[index - 1].id)]?.files?.[0]?.contents
    if (previous !== undefined) return previous
  }
  return referenceStart(game, index)
}
