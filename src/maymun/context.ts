import { useEffect, useRef } from 'react'
import type { RunResult } from '../runners/types.ts'

/** What Maymun knows about a panel: a short title and the text a helper would need. */
export interface PanelContext {
  title: string
  text: string
}

const providers = new Map<string, () => PanelContext>()
const MAX_TEXT = 6000

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

const clip = (text: string) => (text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + '\n…' : text)

/** The context for a panel element: its provider if it has one, otherwise the text it shows. */
export function readContext(panel: HTMLElement): PanelContext & { panel: string; page: string } {
  const name = panel.dataset.maymun ?? 'page'
  const provided = providers.get(name)?.()
  const text = provided?.text ?? (panel.innerText ?? panel.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
  return {
    panel: name,
    page: document.title,
    title: provided?.title ?? document.title,
    text: clip(text),
  }
}

/** Test results as plain text, for a panel's context. */
export function formatChecks(result: RunResult): string {
  const lines = result.tests.map((test) => `${test.passed ? 'PASS' : 'FAIL'} ${test.text}${test.error ? ` — ${test.error}` : ''}`)
  if (result.error) lines.unshift(`Error: ${result.error}`)
  return lines.join('\n') || 'No checks.'
}

/** The instructions and the panel the learner is looking at, sent along with every question. */
export function systemPrompt(context: ReturnType<typeof readContext>, language: string): string {
  return [
    'You are Maymun, a friendly orange cat who helps people learn programming on Learn Platform.',
    `Answer in ${language}. Keep answers short and concrete.`,
    'Lead the learner to the answer with hints and questions; give a full solution only when they ask for it.',
    `The learner is looking at the "${context.panel}" panel of the page "${context.page}". What that panel shows:`,
    `<panel title="${context.title}">`,
    context.text,
    '</panel>',
  ].join('\n')
}
