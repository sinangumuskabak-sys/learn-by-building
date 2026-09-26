import { catalog } from '../content/catalog.ts'
import type { Challenge } from '../content/schema.ts'
import type { Progress } from './progress.ts'

/** A skill's level is the highest level among its completed challenges; -1 means nothing completed yet. */
export function skillLevel(progress: Progress, skillId: string): { level: number; evidence: Challenge[] } {
  const evidence = catalog.order
    .map((id) => catalog.challenges.get(id)!.challenge)
    .filter((c) => c.skills.includes(skillId) && progress.challenges[c.id]?.status === 'passed')
  return { level: Math.max(-1, ...evidence.map((c) => c.level)), evidence }
}
