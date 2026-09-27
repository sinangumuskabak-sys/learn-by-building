import { resolve } from 'node:path'
import { runnableTypes } from '../src/content/schema.ts'
import { loadContentFromDisk } from '../src/content/load-node.ts'
import { validateContent } from '../src/content/validate.ts'
import { loadGamesFromDisk } from '../src/games/load-node.ts'
import { runGameTests } from '../src/games/run.ts'
import { referenceStart } from '../src/games/schema.ts'
import { validateGames } from '../src/games/validate.ts'
import { runChallengeInNode } from '../src/runners/node.ts'
import { allPassed } from '../src/runners/types.ts'

const root = resolve(import.meta.dirname, '../content')
const { content, problems } = loadContentFromDisk(root)
problems.push(...validateContent(content))
const { games, problems: gameProblems } = loadGamesFromDisk(root)
problems.push(...gameProblems, ...validateGames(games, new Set(content.skills.map((s) => s.id))))

// Only run tests on structurally valid content; broken files already produced a clearer message above.
if (problems.length === 0) {
  for (const challenge of content.challenges.filter((c) => runnableTypes.includes(c.type))) {
    const seed = await runChallengeInNode(challenge, challenge.seed)
    if (allPassed(seed)) problems.push(`${challenge.source}: seed code already passes every test`)
    for (const [index, solution] of challenge.solutions.entries()) {
      const result = await runChallengeInNode(challenge, solution)
      if (!allPassed(result)) {
        const failed = result.error ?? result.tests.filter((t) => !t.passed).map((t) => `"${t.text}" — ${t.error}`).join('; ')
        problems.push(`${challenge.source}: solution #${index + 1} fails: ${failed}`)
      }
    }
  }
}

// Every game step: its solution passes, and the code it starts from (previous step's solution) does not.
if (problems.length === 0) {
  for (const game of games) {
    for (const [index, step] of game.steps.entries()) {
      const tests = step.tests.map((t) => ({ text: t.text.en, code: t.code }))
      const start = runGameTests({ code: referenceStart(game, index), tests, canvas: game.canvas })
      if (allPassed(start)) problems.push(`${step.source}: starting code already passes every test`)
      const result = runGameTests({ code: step.solution, tests, canvas: game.canvas })
      if (!allPassed(result)) {
        const failed = result.error ?? result.tests.filter((t) => !t.passed).map((t) => `"${t.text}" — ${t.error}`).join('; ')
        problems.push(`${step.source}: solution fails: ${failed}`)
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} content problem(s):`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}
console.log(
  `✓ content OK — ${content.curriculum.categories.length} categories, ${content.skills.length} skills, ${content.challenges.length} challenges, ${games.length} games / ${games.reduce((n, g) => n + g.steps.length, 0)} steps (solutions pass, seeds fail)`,
)
