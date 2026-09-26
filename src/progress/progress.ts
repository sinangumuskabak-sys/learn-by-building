import { z } from 'zod'
import type { CodeFile } from '../content/schema.ts'
import { createPersistedStore, useStore } from '../lib/store.ts'

const codeFile = z.object({ name: z.string(), lang: z.string(), contents: z.string() })

const challengeProgress = z.object({
  status: z.enum(['started', 'passed']),
  /** The learner's latest code; absent until they edit. */
  files: z.array(codeFile).optional(),
  /** Free-text answer for design challenges. */
  answer: z.string().optional(),
  /** Indexes of rubric items the learner ticked. */
  rubric: z.array(z.number().int()).optional(),
  passedAt: z.string().optional(),
  updatedAt: z.string(),
})
export type ChallengeProgress = z.infer<typeof challengeProgress>

export const progressSchema = z.object({
  version: z.literal(1),
  challenges: z.record(z.string(), challengeProgress),
})
export type Progress = z.infer<typeof progressSchema>

const empty: Progress = { version: 1, challenges: {} }

export const progressStore = createPersistedStore<Progress>('lp.progress.v1', empty, (raw) => {
  const parsed = progressSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
})

export function useProgress(): Progress {
  return useStore(progressStore)
}

type Patch = Partial<Omit<ChallengeProgress, 'updatedAt'>>

function update(id: string, patch: Patch) {
  progressStore.set((current) => {
    const previous = current.challenges[id]
    const next: ChallengeProgress = {
      ...previous,
      ...patch,
      status: patch.status ?? previous?.status ?? 'started',
      updatedAt: new Date().toISOString(),
    }
    // Once passed, a challenge stays passed even if the learner keeps editing.
    if (previous?.status === 'passed') {
      next.status = 'passed'
      next.passedAt = previous.passedAt
    }
    return { ...current, challenges: { ...current.challenges, [id]: next } }
  })
}

export const progressActions = {
  saveFiles: (id: string, files: CodeFile[]) => update(id, { files }),
  saveAnswer: (id: string, answer: string) => update(id, { answer }),
  saveRubric: (id: string, rubric: number[]) => update(id, { rubric }),
  markPassed: (id: string) => update(id, { status: 'passed', passedAt: new Date().toISOString() }),
  resetFiles: (id: string) => update(id, { files: undefined }),
  resetAll: () => progressStore.set(empty),
  exportJson: () => JSON.stringify(progressStore.get(), null, 2),
  /** Returns false when the text is not a valid export. */
  importJson(text: string): boolean {
    try {
      const parsed = progressSchema.safeParse(JSON.parse(text))
      if (!parsed.success) return false
      progressStore.set(parsed.data)
      return true
    } catch {
      return false
    }
  },
}

export type ChallengeStatus = 'new' | 'started' | 'passed'

export function statusOf(progress: Progress, id: string): ChallengeStatus {
  return progress.challenges[id]?.status ?? 'new'
}
