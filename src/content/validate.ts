import { runnableTypes, type Challenge, type ChallengeType, type Curriculum, type Skill } from './schema.ts'

const seedLangs: Partial<Record<ChallengeType, string[]>> = {
  'code-js': ['js'],
  'code-ts': ['ts'],
  web: ['html', 'css', 'js'],
  sql: ['sql'],
}

/** Checks that a parsed challenge has everything its type needs. Returns human-readable problems. */
export function validateChallenge(challenge: Challenge): string[] {
  const problems: string[] = []
  const add = (message: string) => problems.push(`${challenge.source}: ${message}`)

  if (!challenge.description) add('"# --description--" is empty or missing')

  if (runnableTypes.includes(challenge.type)) {
    if (challenge.seed.length === 0) add('runnable challenge needs "# --seed--" code')
    if (challenge.tests.length === 0) add('runnable challenge needs at least one test in "# --hints--"')
    if (challenge.solutions.length === 0) add('runnable challenge needs a reference solution in "# --solutions--"')
    const allowed = seedLangs[challenge.type] ?? []
    for (const file of challenge.seed) {
      if (!allowed.includes(file.lang)) add(`seed file "${file.name}" uses "${file.lang}", expected ${allowed.join('/')}`)
    }
    const seedNames = challenge.seed.map((f) => f.name).sort().join(',')
    challenge.solutions.forEach((solution, index) => {
      const names = solution.map((f) => f.name).sort().join(',')
      if (names !== seedNames) add(`solution #${index + 1} files [${names}] do not match seed files [${seedNames}]`)
    })
    if (challenge.type === 'web' && !challenge.seed.some((f) => f.lang === 'html')) add('web challenge needs an html seed file')
  } else if (challenge.tests.length > 0 || challenge.solutions.length > 0) {
    add(`"${challenge.type}" challenges are not auto-tested; remove "# --hints--" / "# --solutions--"`)
  }

  if (challenge.type === 'quiz' || challenge.type === 'read') {
    if (challenge.questions.length === 0) add(`"${challenge.type}" challenge needs "# --questions--"`)
    for (const question of challenge.questions) {
      const correct = question.options.filter((o) => o.correct).length
      if (question.options.length < 2) add(`question "${question.prompt}" needs at least two options`)
      if (correct === 0 || correct === question.options.length) {
        add(`question "${question.prompt}" needs at least one correct and one wrong option`)
      }
    }
  }
  // A Turkish version must be the same quiz: same questions, same options, same answers.
  const { questions: trQuestions, rubric: trRubric } = challenge.tr ?? {}
  if (trQuestions) {
    const shape = (qs: Challenge['questions']) => qs.map((q) => q.options.map((o) => (o.correct ? 'x' : '-')).join('')).join('|')
    if (shape(trQuestions) !== shape(challenge.questions)) {
      add('"# --questions-tr--" must have the same questions, options and correct answers as "# --questions--"')
    }
  }
  if (trRubric && trRubric.length !== challenge.rubric.length) add('"# --rubric-tr--" must have as many lines as "# --rubric--"')
  if (challenge.type === 'read' && challenge.seed.length === 0) add('"read" challenge needs code to read in "# --seed--"')
  if (challenge.type === 'design' && challenge.rubric.length === 0) add('"design" challenge needs "# --rubric--"')

  return problems
}

export interface ContentSet {
  curriculum: Curriculum
  skills: Skill[]
  challenges: Challenge[]
}

/** Cross-file checks: unique ids, every challenge placed exactly once, every skill reference resolvable. */
export function validateContent({ curriculum, skills, challenges }: ContentSet): string[] {
  const problems: string[] = []

  const duplicates = (ids: string[]) => ids.filter((id, index) => ids.indexOf(id) !== index)
  for (const id of duplicates(curriculum.categories.map((c) => c.id))) problems.push(`duplicate category id "${id}"`)
  const moduleIds = curriculum.categories.flatMap((c) => c.modules.map((m) => m.id))
  for (const id of duplicates(moduleIds)) problems.push(`duplicate module id "${id}"`)
  for (const id of duplicates(skills.map((s) => s.id))) problems.push(`duplicate skill id "${id}"`)
  for (const id of duplicates(challenges.map((c) => c.id))) problems.push(`duplicate challenge id "${id}"`)

  const categoryIds = new Set(curriculum.categories.map((c) => c.id))
  for (const skill of skills) {
    if (!categoryIds.has(skill.category)) problems.push(`skill "${skill.id}" points to unknown category "${skill.category}"`)
  }

  const placed = curriculum.categories.flatMap((c) => c.modules.flatMap((m) => m.challenges))
  for (const id of duplicates(placed)) problems.push(`challenge "${id}" is listed in more than one module`)
  const challengeIds = new Set(challenges.map((c) => c.id))
  for (const id of placed) if (!challengeIds.has(id)) problems.push(`curriculum lists missing challenge "${id}"`)
  const placedIds = new Set(placed)
  for (const challenge of challenges) {
    if (!placedIds.has(challenge.id)) problems.push(`${challenge.source}: not listed in any module of curriculum.json`)
  }

  const skillIds = new Set(skills.map((s) => s.id))
  for (const challenge of challenges) {
    for (const skill of challenge.skills) {
      if (!skillIds.has(skill)) problems.push(`${challenge.source}: unknown skill "${skill}" (add it to skills.json)`)
    }
    problems.push(...validateChallenge(challenge))
  }

  return problems
}
