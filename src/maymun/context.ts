import { useEffect, useRef } from 'react'
import type { RunResult } from '../runners/types.ts'
import instructions from './prompt.md?raw'

/** What Maymun knows about a panel: a short title and the text a helper would need. */
export interface PanelContext {
  title: string
  text: string
}

const providers = new Map<string, () => PanelContext>()
const MAX_TEXT = 6000
/** The other panels of the page go along shorter: they are background. */
const MAX_OTHER = 3000

/**
 * Lets a panel tell Maymun more than what is on the screen (the whole code, test results, errors).
 * Panels without a provider are read from their visible text.
 */
export function useMaymunContext(panel: string, get: () => PanelContext) {
  const latest = useRef(get)
  useEffect(() => {
    latest.current = get
  })
  useEffect(() => {
    const provider = () => latest.current()
    providers.set(panel, provider)
    return () => {
      if (providers.get(panel) === provider) providers.delete(panel)
    }
  }, [panel])
}

const clip = (text: string, max = MAX_TEXT) => (text.length > max ? text.slice(0, max) + '\n…' : text)

export interface NamedContext extends PanelContext {
  panel: string
}

/**
 * The text a panel shows. A drop-down list counts as its chosen item only: the whole list (a service's hundreds of
 * models) would push the rest of the page out of what Maymun reads.
 */
function shownText(panel: HTMLElement): string {
  const lists = panel.querySelectorAll('select')
  if (!lists.length || panel.innerText === undefined) return panel.innerText ?? panel.textContent ?? ''
  const copy = panel.cloneNode(true) as HTMLElement
  copy.querySelectorAll('select').forEach((list, i) => list.replaceWith(document.createTextNode(lists[i].selectedOptions[0]?.text ?? '')))
  // Laid out off screen, at the panel's width, so the text keeps its line breaks.
  const holder = document.createElement('div')
  holder.style.cssText = `position:fixed;left:-100000px;top:0;width:${panel.clientWidth}px`
  holder.append(copy)
  document.body.append(holder)
  try {
    return copy.innerText
  } finally {
    holder.remove()
  }
}

/** What one panel element holds: its provider if it has one, otherwise the text it shows. */
function panelContext(panel: HTMLElement, max: number): NamedContext {
  const name = panel.dataset.maymun ?? 'page'
  const provided = providers.get(name)?.()
  const text = provided?.text ?? shownText(panel).replace(/\n{3,}/g, '\n\n').trim()
  return { panel: name, title: provided?.title ?? document.title, text: clip(text, max) }
}

/**
 * The context for a question: the panel the learner is looking at, plus the other panels of the page (the task, the
 * code, the checks), so a question about the code also knows what the step asks for.
 */
export function readContext(panel: HTMLElement): NamedContext & { page: string; others: NamedContext[] } {
  const main = panelContext(panel, MAX_TEXT)
  const seen = new Set([main.panel, 'page'])
  const others: NamedContext[] = []
  for (const el of document.querySelectorAll<HTMLElement>('[data-maymun]')) {
    const name = el.dataset.maymun ?? 'page'
    if (seen.has(name) || el.contains(panel)) continue
    seen.add(name)
    const other = panelContext(el, MAX_OTHER)
    if (other.text) others.push(other)
  }
  return { ...main, page: document.title, others }
}

/** Test results as plain text, for a panel's context. */
export function formatChecks(result: RunResult): string {
  const lines = result.tests.map((test) => `${test.passed ? 'PASS' : 'FAIL'} ${test.text}${test.error ? ` — ${test.error}` : ''}`)
  if (result.error) lines.unshift(`Error: ${result.error}`)
  return lines.join('\n') || 'No checks.'
}

/** Maymun's own instructions (`prompt.md`) and what the learner sees, sent along with every question. */
/** What each page of the app is for, so Maymun knows where the learner is even when the page shows little text. */
export function pagePurpose(path: string): string {
  if (/^\/games\/[^/]+/.test(path)) {
    return 'A step of a project the learner builds step by step: the lesson in four parts (what we are doing, the code, what it means, your turn) in the task panel, their code (game.js, or index.html for a web page), the running game or page, and the checks for this step.'
  }
  if (path === '/games' || path === '/' || path === '') {
    return 'The Workshop (home page): build projects (web pages) and games built step by step, with the learner\'s progress in each.'
  }
  if (path === '/skills') return 'The skill map: every skill with the learner\'s level (L0-L8) and the challenges or game steps that show it.'
  if (path === '/memory') {
    return 'The memory vault: the learner\'s Markdown notes (status, what they learned, their own notes) for every category, challenge, game, step and skill; they can download it or copy it into Obsidian.'
  }
  if (path === '/settings') {
    return 'Settings: theme, language, showing Maymun, the AI service and key Maymun answers through, the editor font size, exporting or importing progress, and resetting all data.'
  }
  return 'A page of Learn by Building.'
}

/** Where the learner is: the page's title, address and purpose, and the page of their previous question if it differs. */
export interface PagePlace {
  path: string
  title: string
  /** The page of the learner's previous question, when it was another one. */
  previous?: string
}

export function systemPrompt(
  context: ReturnType<typeof readContext>,
  language: string,
  project?: string,
  /** The memory vault part: its instructions, the notes that matter now, where Maymun may write. */
  memory?: string,
  page?: PagePlace,
  /** The map of the whole app, when Maymun asked for it (see app-map.ts). */
  map?: string,
): string {
  const block = (c: NamedContext) => [`<panel name="${c.panel}" title="${c.title}">`, c.text, '</panel>']
  return [
    instructions.trim(),
    '',
    `The learner's interface language: ${language}.`,
    ...(project
      ? [
          '',
          `# This project: ${project}`,
          '',
          'The conversation below goes on across panels (lesson, code, game, checks), steps and projects. Each learner',
          'message starts with where it was asked, like "[code panel, step 03-gravity, page "Flappy"]". Connect to',
          'earlier questions when it helps ("the error you asked about in the code panel").',
        ]
      : []),
    ...(page
      ? [
          '',
          '# The page they are on now',
          '',
          `"${page.title}" (${page.path || '/'}): ${pagePurpose(page.path)}`,
          ...(page.previous
            ? [
                `They moved here from "${page.previous}" since their previous question. Answer about this page and what it shows`,
                'now, not the previous one, unless they ask about it.',
              ]
            : []),
          'Learner messages also say on which page they were asked.',
        ]
      : []),
    '',
    `# What the learner sees now (page "${context.page}")`,
    '',
    'They were looking at this panel when they asked:',
    ...block(context),
    ...(context.others.length ? ['', 'The other panels of the page:', ...context.others.flatMap(block)] : []),
    ...(memory ? ['', memory] : []),
    ...(map ? ['', map, '', 'You asked for the map above: answer the question with it now; do not ask for it again.'] : []),
  ].join('\n')
}
