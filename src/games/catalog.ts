import content from 'virtual:games'
import type { Progress } from '../progress/progress.ts'
import { referenceStart, stepKey, type Difficulty, type Game, type GameStep } from './schema.ts'

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

/** Skill level shown for a passed game step: writing a step's code yourself is at least "implement". */
const difficultyLevel: Record<Difficulty, number> = { beginner: 3, intermediate: 4, advanced: 5 }

/** Passed game steps that practise a skill, and the level they prove. */
export function gameSkillEvidence(progress: Progress, skillId: string) {
  const steps: { game: Game; step: GameStep; index: number }[] = []
  for (const game of games) {
    game.steps.forEach((step, index) => {
      if (step.skills.includes(skillId) && stepPassed(progress, game, index)) steps.push({ game, step, index })
    })
  }
  return { level: Math.max(-1, ...steps.map(({ game }) => difficultyLevel[game.difficulty])), steps }
}
