import { assert } from 'chai'
import { transform } from 'sucrase'
import type { TestCase } from '../content/schema.ts'
import type { RunResult, TestResult } from './types.ts'

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...values: unknown[]) => Promise<unknown>

export function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return `${error.name === 'AssertionError' ? '' : `${error.name}: `}${error.message}`
  return String(error)
}

/** Strips TypeScript syntax; type errors are not reported (tests check behaviour, not types). */
export function transpileTs(source: string): string {
  return transform(source, { transforms: ['typescript'], disableESTransforms: true }).code
}

export interface JsRunInput {
  /** The learner's code, already plain JavaScript. */
  code: string
  /** The raw source as the learner wrote it (before transpiling), exposed to tests as `code`. */
  rawCode: string
  setup: string
  tests: TestCase[]
  /** Extra names visible to learner code and tests, e.g. `document` for web challenges. */
  globals?: Record<string, unknown>
}

/**
 * Runs each test in a fresh scope made of setup + learner code + test code, like freeCodeCamp does,
 * so tests can read the learner's top-level `const`s. Learner code therefore runs once per test.
 */
export async function runJsTests(input: JsRunInput): Promise<RunResult> {
  const logs: string[] = []
  let capture = true
  const log = (...args: unknown[]) => {
    if (capture) logs.push(args.map(formatValue).join(' '))
  }
  const fakeConsole = { log, info: log, warn: log, error: log, debug: log }

  const globals = { assert, console: fakeConsole, ...input.globals }
  const names = Object.keys(globals)
  const values = Object.values(globals)
  // `code` is bound after the learner's code runs so a learner variable named `code` cannot break the tests.
  const body = (test: string) =>
    `${input.setup}\n;${input.code}\n;await (async (code) => {\n${test}\n})(__rawCode);`

  // A syntax error in the learner's code fails every test the same way; report it once.
  try {
    new AsyncFunction(...names, '__rawCode', `${input.setup}\n;${input.code}`)
  } catch (error) {
    return { tests: input.tests.map((t) => ({ text: t.text, passed: false })), logs, error: errorMessage(error) }
  }

  const tests: TestResult[] = []
  for (const test of input.tests) {
    try {
      await new AsyncFunction(...names, '__rawCode', body(test.code))(...values, input.rawCode)
      tests.push({ text: test.text, passed: true })
    } catch (error) {
      tests.push({ text: test.text, passed: false, error: errorMessage(error) })
    }
    capture = false
  }
  return { tests, logs }
}
