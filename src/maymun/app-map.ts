import { catalog, type Catalog } from '../content/catalog.ts'
import type { LocalizedText } from '../content/schema.ts'
import { games as allGames } from '../games/catalog.ts'
import { difficulties, stepKey, type GameSummary } from '../games/schema.ts'
import type { Lang } from '../i18n/messages.ts'
import { statusOf, type Progress } from '../progress/progress.ts'

/**
 * The whole app in short Markdown for Maymun: its pages, categories, challenges and games, with links and the learner's
 * progress. Built from the content itself, so it is never out of date. It is long, so it goes along only when Maymun
 * asks for it (see APP_MAP_MARKER).
 */

/** What Maymun answers with, and nothing else, when it needs the map to answer. */
export const APP_MAP_MARKER = '<app-map/>'

/** Whether an answer so far is (or may still become) the request for the map, so it is not shown yet. */
export const mayAskForMap = (text: string) => {
  const start = text.trimStart()
  return start.length < APP_MAP_MARKER.length ? APP_MAP_MARKER.startsWith(start) : start.startsWith(APP_MAP_MARKER)
}

/** Whether a finished (or long enough) answer is the request for the map. */
export const asksForMap = (text: string) => text.trim().startsWith(APP_MAP_MARKER)

const typeNames: Record<string, string> = {
  'code-js': 'JavaScript code',
  'code-ts': 'TypeScript code',
  web: 'web page (HTML/CSS/JS)',
  sql: 'SQL',
  quiz: 'quiz',
  read: 'read the code, answer questions',
  design: 'written design answer',
}

export function appMap(lang: Lang, progress: Progress, source: Catalog = catalog, games: GameSummary[] = allGames): string {
  const text = (t: LocalizedText) => (lang === 'tr' && t.tr) || t.en
  const lines = [
    '# Learn Platform: the map of the app',
    '',
    `Names are as the learner sees them (interface language: ${lang}). Links work in your answers as Markdown links,`,
    'for example [Snake](#/games/snake).',
    '',
    '## Menu (top bar)',
    '',
    '- Catalog (#/): categories of short challenges, a search box, and a button for the next unfinished challenge.',
    '- Games (#/games): the Game Workshop; a real game is built step by step, easier games first.',
    '- Skills (#/skills): every skill with the learner\'s level (L0-L8) and what shows it.',
    '- Memory (#/memory): the memory vault, notes for everything; download it or copy it live into Obsidian.',
    '- Settings (#/settings): theme, language, showing Maymun, the AI service Maymun answers through, editor font size,',
    '  exporting or importing progress, resetting all data.',
    '- Language (TR/EN) and light/dark theme switches sit at the right of the top bar.',
    '- Maymun (you): the cat at the right edge of the panel the learner points at; a click opens the chat. The camera',
    '  button sends a picture of the screen with the next question.',
    '',
    '## Categories and challenges',
    '',
  ]
  for (const category of source.curriculum.categories) {
    const ids = category.modules.flatMap((m) => m.challenges).filter((id) => source.challenges.has(id))
    const done = ids.filter((id) => statusOf(progress, id) === 'passed').length
    lines.push(`- ${text(category.title)} (#/c/${category.id}): ${ids.length ? `${done}/${ids.length} done` : 'coming soon, no challenges yet'}`)
    for (const id of ids) {
      const { challenge } = source.challenges.get(id)!
      const title = (lang === 'tr' && challenge.title_tr) || challenge.title
      lines.push(`  - ${title} (#/learn/${id}): ${typeNames[challenge.type] ?? challenge.type}, level L${challenge.level}, ${statusOf(progress, id)}`)
    }
  }
  lines.push('', '## Games (Game Workshop)', '', 'Each game is built in steps; a step is done when all its checks pass.', '')
  for (const difficulty of difficulties) {
    const list = games.filter((g) => g.difficulty === difficulty).sort((a, b) => a.order - b.order)
    if (!list.length) continue
    lines.push(`### ${difficulty[0].toUpperCase()}${difficulty.slice(1)}`, '')
    for (const game of list) {
      const done = game.steps.filter((s) => statusOf(progress, stepKey(game.id, s.id)) === 'passed').length
      const where = done === game.steps.length ? 'finished' : done ? `${done}/${game.steps.length} steps done` : `${game.steps.length} steps, not started`
      lines.push(`- ${text(game.title)} (#/games/${game.id}): ${text(game.description)} [${where}]`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}
