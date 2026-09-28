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

/** What one panel element holds: its provider if it has one, otherwise the text it shows. */
function panelContext(panel: HTMLElement, max: number): NamedContext {
  const name = panel.dataset.maymun ?? 'page'
  const provided = providers.get(name)?.()
  const text = provided?.text ?? (panel.innerText ?? panel.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
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
export function systemPrompt(context: ReturnType<typeof readContext>, language: string): string {
  const block = (c: NamedContext) => [`<panel name="${c.panel}" title="${c.title}">`, c.text, '</panel>']
  return [
    instructions.trim(),
    '',
    `The learner's interface language: ${language}.`,
    '',
    `# What the learner sees now (page "${context.page}")`,
    '',
    'They were looking at this panel when they asked:',
    ...block(context),
    ...(context.others.length ? ['', 'The other panels of the page:', ...context.others.flatMap(block)] : []),
  ].join('\n')
}
