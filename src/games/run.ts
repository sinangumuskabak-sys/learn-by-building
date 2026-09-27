import { assert } from 'chai'
import { errorMessage, formatValue } from '../runners/js-core.ts'
import type { RunResult, TestResult } from '../runners/types.ts'
import { createSim, type CanvasSize } from './sim.ts'

export interface GameTest {
  text: string
  code: string
}

export interface GameRunInput {
  code: string
  tests: GameTest[]
  canvas: CanvasSize
}

/**
 * Runs each test on a fresh simulated page: learner code runs first (its top-level `let`/`const` stay
 * visible to the test through the returned closure), then the test drives the page through `$`.
 * Test helpers are closure parameters, so learner names like `game` or `assert` cannot clash with them.
 */
export function runGameTests(input: GameRunInput): RunResult {
  const logs: string[] = []
  let capture = true
  const log = (...args: unknown[]) => {
    if (capture && logs.length < 200) logs.push(args.map(formatValue).join(' '))
  }
  const console = { log, info: log, warn: log, error: log, debug: log, table: log }
  const body = `${input.code}\n;return (assert, $) => {\n`
  const make = (test: string, names: string[]) => new Function(...names, `${body}${test}\n}`)

  const probe = createSim(input.canvas)
  const names = [...Object.keys(probe.globals), 'console']
  try {
    make('', names)
  } catch (error) {
    return { tests: input.tests.map((t) => ({ text: t.text, passed: false })), logs, error: errorMessage(error) }
  }

  const tests: TestResult[] = []
  for (const test of input.tests) {
    const { globals, $ } = createSim(input.canvas)
    try {
      const values = [...Object.values(globals), console]
      const check = make(test.code, names)(...values) as (a: typeof assert, driver: typeof $) => void
      check(assert, $)
      tests.push({ text: test.text, passed: true })
    } catch (error) {
      tests.push({ text: test.text, passed: false, error: errorMessage(error) })
    }
    capture = false
  }
  return { tests, logs }
}
