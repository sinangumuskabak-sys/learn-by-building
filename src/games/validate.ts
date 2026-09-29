import { parsePredict, type Game } from './schema.ts'

/** Structural checks for games; running the tests is done by `npm run validate`. */
export function validateGames(games: Game[], skillIds: Set<string>): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const game of games) {
    const where = `games/${game.id}`
    if (seen.has(game.id)) problems.push(`${where}: duplicate game id`)
    seen.add(game.id)
    if (!game.title.tr || !game.description.tr) problems.push(`${where}/game.json: title and description need "tr"`)
    for (const skill of game.skills) if (!skillIds.has(skill)) problems.push(`${where}/game.json: unknown skill "${skill}"`)
    if (game.steps.length === 0) problems.push(`${where}: no steps in steps/`)

    game.steps.forEach((step, index) => {
      const add = (message: string) => problems.push(`${step.source}: ${message}`)
      if (!/^\d{2}-[a-z0-9-]+$/.test(step.id)) add('file name must look like "01-some-step.md"')
      if (index === 0 && !step.seed) add('the first step needs "# --seed--" code')
      if (index > 0 && step.seed) add('only the first step has "# --seed--"; later steps start from the previous solution')
      if (step.tests.length === 0) add('needs at least one test')
      if (!step.title.tr) add('frontmatter needs "title_tr"')
      const parts = [step.goal, step.code, step.meaning]
      // A "build it yourself" step (the last one) has a goal and a task but no code to copy and no meaning.
      const own = !!step.goal && !step.code && !step.meaning
      if (step.explanation && parts.some(Boolean)) add('use either "# --explanation--" or goal/code/meaning, not both')
      else if (!step.explanation && !own && !parts.every(Boolean)) {
        add('needs "# --goal--", "# --code--" and "# --meaning--" (or an "# --explanation--", or only a goal for a build-it-yourself step)')
      }
      if (own && index !== game.steps.length - 1) add('a build-it-yourself step (a goal without code) can only be the last step')
      for (const [name, text] of Object.entries({ explanation: step.explanation, goal: step.goal, meaning: step.meaning, predict: step.predict, hint: step.hint, try: step.try })) {
        if (text && !text.tr) add(`needs "# --${name}-tr--"`)
      }
      for (const text of step.predict ? [step.predict.en, step.predict.tr ?? ''] : []) {
        const { question, options } = parsePredict(text)
        if (!question || options.length < 2 || options.filter((o) => o.correct).length !== 1) {
          add('"# --predict--" needs a question and at least two "- [ ]" options, exactly one marked "- [x]"')
        }
      }
      if (!step.task.tr) add('needs "# --task-tr--"')
      for (const test of step.tests) if (!test.text.tr) add(`test "${test.text.en}" needs a "tr:" line`)
      for (const skill of step.skills) if (!skillIds.has(skill)) add(`unknown skill "${skill}"`)
    })
  }
  return problems
}
