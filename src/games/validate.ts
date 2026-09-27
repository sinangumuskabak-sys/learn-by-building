import type { Game } from './schema.ts'

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
      if (!step.explanation.tr) add('needs "# --explanation-tr--"')
      if (!step.task.tr) add('needs "# --task-tr--"')
      for (const test of step.tests) if (!test.text.tr) add(`test "${test.text.en}" needs a "tr:" line`)
      for (const skill of step.skills) if (!skillIds.has(skill)) add(`unknown skill "${skill}"`)
    })
  }
  return problems
}
