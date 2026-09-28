import type { Challenge } from './schema.ts'

/** The challenge with its Turkish texts swapped in where they exist. */
export function localizeChallenge(challenge: Challenge, lang: string): Challenge {
  if (lang !== 'tr') return challenge
  const tr = challenge.tr ?? {}
  return {
    ...challenge,
    title: challenge.title_tr ?? challenge.title,
    description: tr.description || challenge.description,
    instructions: tr.instructions || challenge.instructions,
    tests: challenge.tests.map((test) => (test.tr ? { ...test, text: test.tr } : test)),
    questions: tr.questions ?? challenge.questions,
    rubric: tr.rubric ?? challenge.rubric,
  }
}
