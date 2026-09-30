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

export function appMap(lang: Lang, progress: Progress, games: GameSummary[] = allGames): string {
  const text = (t: LocalizedText) => (lang === 'tr' && t.tr) || t.en
  const lines = [
    '# Learn by Building: the map of the app',
    '',
    `Names are as the learner sees them (interface language: ${lang}). Links work in your answers as Markdown links,`,
    'for example [Snake](/games/snake).',
    '',
    '## Menu (top bar)',
    '',
    '- Workshop (/games, also the home page): build projects (web pages that change as you type) and games, each built',
    '  step by step. Every step has four parts in order: what we are doing, the code, what it means, your turn.',
    '- Skills (/skills): every skill with the learner\'s level (L0-L8) and what shows it.',
    '- Memory (/memory): the memory vault, notes for everything; download it or copy it live into Obsidian.',
    '- Settings (/settings): theme, language, showing Maymun, the AI service Maymun answers through, editor font size,',
    '  exporting or importing progress, resetting all data.',
    '- Language (TR/EN) and light/dark theme switches sit at the right of the top bar.',
    '- Maymun (you): the cat at the right edge of the panel the learner points at; a click opens the chat. The camera',
    '  button sends a picture of the screen with the next question.',
  ]
  const item = (game: GameSummary) => {
    const done = game.steps.filter((s) => statusOf(progress, stepKey(game.id, s.id)) === 'passed').length
    const where = done === game.steps.length ? 'finished' : done ? `${done}/${game.steps.length} steps done` : `${game.steps.length} steps, not started`
    return `- ${text(game.title)} (/games/${game.id}): ${text(game.description)} [${where}]`
  }
  const projects = games.filter((g) => g.kind === 'web').sort((a, b) => a.order - b.order)
  if (projects.length) {
    lines.push('', '## Build projects (web pages)', '', 'The page updates as the learner types; a step is done when all its checks pass.', '')
    lines.push(...projects.map(item))
  }
  lines.push('', '## Games', '', 'Each game is built in steps; a step is done when all its checks pass.', '')
  for (const difficulty of difficulties) {
    const list = games.filter((g) => g.kind === 'game' && g.difficulty === difficulty).sort((a, b) => a.order - b.order)
    if (!list.length) continue
    lines.push(`### ${difficulty[0].toUpperCase()}${difficulty.slice(1)}`, '', ...list.map(item), '')
  }
  return lines.join('\n').trim()
}
