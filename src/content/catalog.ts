import content from 'virtual:content'
import type { Category, Challenge, CurriculumModule, Curriculum, Skill } from './schema.ts'

export interface ChallengeEntry {
  challenge: Challenge
  category: Category
  module: CurriculumModule
  /** Position in the whole curriculum, used for previous/next navigation. */
  index: number
}

export interface Catalog {
  curriculum: Curriculum
  skills: Skill[]
  challenges: Map<string, ChallengeEntry>
  /** Challenge ids in curriculum order. */
  order: string[]
}

export function buildCatalog(curriculum: Curriculum, skills: Skill[], challengeList: Challenge[]): Catalog {
  const byId = new Map(challengeList.map((c) => [c.id, c]))
  const challenges = new Map<string, ChallengeEntry>()
  const order: string[] = []
  for (const category of curriculum.categories) {
    for (const module of category.modules) {
      for (const id of module.challenges) {
        const challenge = byId.get(id)
        // CI's validate step guarantees every listed id exists; skip defensively rather than crash the app.
        if (!challenge) continue
        challenges.set(id, { challenge, category, module, index: order.length })
        order.push(id)
      }
    }
  }
  return { curriculum, skills, challenges, order }
}

// Content is parsed and validated at build time (see the content plugin in vite.config.ts), so the browser
// only receives plain JSON.
export const catalog = buildCatalog(content.curriculum, content.skills, content.challenges)

export function categoryChallenges(category: Category): Challenge[] {
  return category.modules.flatMap((m) =>
    m.challenges.map((id) => catalog.challenges.get(id)?.challenge).filter((c): c is Challenge => !!c),
  )
}
