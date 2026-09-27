import { afterEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { formatChecks, readContext, useMaymunContext } from './context.ts'
import { currentPanel } from './tracker.ts'

function panel(name: string, text: string) {
  const el = document.createElement('div')
  el.dataset.maymun = name
  el.textContent = text
  document.body.append(el)
  return el
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Maymun context', () => {
  it('reads a panel from its provider while mounted, from its text otherwise', () => {
    const el = panel('code', 'what the screen shows')
    const { unmount, rerender } = renderHook(({ code }) => useMaymunContext('code', () => ({ title: 'game.js', text: code })), {
      initialProps: { code: 'let a = 1' },
    })
    rerender({ code: 'let a = 2' })
    expect(readContext(el)).toMatchObject({ panel: 'code', title: 'game.js', text: 'let a = 2' })
    unmount()
    expect(readContext(el).text).toBe('what the screen shows')
  })

  it('clips long text', () => {
    const el = panel('task', 'x'.repeat(10000))
    expect(readContext(el).text.length).toBeLessThan(6100)
  })

  it('formats checks with errors first', () => {
    const text = formatChecks({
      error: 'SyntaxError',
      logs: [],
      tests: [
        { text: 'draws', passed: true },
        { text: 'moves', passed: false, error: 'x stayed 0' },
      ],
    })
    expect(text).toBe('Error: SyntaxError\nPASS draws\nFAIL moves — x stayed 0')
  })
})

describe('Maymun tracker', () => {
  it('prefers an inner panel over the page when nothing was pointed at', () => {
    const page = panel('page', '')
    const task = panel('task', '')
    const rect = { width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100, x: 0, y: 0, toJSON() {} }
    page.getBoundingClientRect = () => rect as DOMRect
    task.getBoundingClientRect = () => rect as DOMRect
    expect(currentPanel()).toBe(task)
  })
})
