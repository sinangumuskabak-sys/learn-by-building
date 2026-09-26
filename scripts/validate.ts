import { resolve } from 'node:path'
import { loadContentFromDisk } from '../src/content/load-node.ts'
import { validateContent } from '../src/content/validate.ts'

const root = resolve(import.meta.dirname, '../content')
const { content, problems } = loadContentFromDisk(root)
problems.push(...validateContent(content))

if (problems.length > 0) {
  console.error(`✗ ${problems.length} content problem(s):`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}
console.log(
  `✓ content OK — ${content.curriculum.categories.length} categories, ${content.skills.length} skills, ${content.challenges.length} challenges`,
)
