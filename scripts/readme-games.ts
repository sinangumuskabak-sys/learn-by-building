// Rewrites the project and game lists in README.md (between the games:* markers) from content/games/*/game.json.
// Run with `npm run readme:games` after adding a game or a project.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface GameJson {
  id: string
  order: number
  kind?: 'game' | 'web'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  title: { en: string; tr: string }
}

const dir = 'content/games'
const all = readdirSync(dir).map((id) => ({
  ...(JSON.parse(readFileSync(join(dir, id, 'game.json'), 'utf8')) as GameJson),
  steps: readdirSync(join(dir, id, 'steps')).length,
}))
const levels = ['beginner', 'intermediate', 'advanced'] as const
all.sort((a, b) => levels.indexOf(a.difficulty) - levels.indexOf(b.difficulty) || a.order - b.order)
const projects = all.filter((g) => g.kind === 'web')
const games = all.filter((g) => g.kind !== 'web')
const steps = all.reduce((sum, g) => sum + g.steps, 0)

function list(lang: 'en' | 'tr', labels: string[], projectsLabel: string) {
  return [
    `- **${projectsLabel}:** ` + projects.map((g) => g.title[lang]).join(' · '),
    ...levels.map((level, i) => `- **${labels[i]}:** ` + games.filter((g) => g.difficulty === level).map((g) => g.title[lang]).join(' · ')),
  ].join('\n')
}

const blocks = {
  en: `${projects.length} build projects and ${games.length} games, ${steps} steps:\n\n${list('en', ['Beginner games', 'Intermediate games', 'Advanced games'], 'Build projects')}`,
  tr: `${projects.length} yapım atölyesi ve ${games.length} oyun, ${steps} adım:\n\n${list('tr', ['Başlangıç oyunları', 'Orta oyunlar', 'İleri oyunlar'], 'Yapım atölyeleri')}`,
}

let readme = readFileSync('README.md', 'utf8')
for (const [lang, text] of Object.entries(blocks)) {
  const pattern = new RegExp(`(<!-- games:${lang}:start -->\\n)[\\s\\S]*?(\\n<!-- games:${lang}:end -->)`)
  if (!pattern.test(readme)) throw new Error(`README.md has no games:${lang} markers`)
  readme = readme.replace(pattern, `$1${text}$2`)
}
writeFileSync('README.md', readme)
console.log(`README.md: ${projects.length} projects, ${games.length} games, ${steps} steps`)
