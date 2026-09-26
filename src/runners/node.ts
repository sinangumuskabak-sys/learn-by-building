import { JSDOM, VirtualConsole } from 'jsdom'
import type { Challenge, CodeFile } from '../content/schema.ts'
import { buildDocument, jsInput, sqlInput } from './challenge-input.ts'
import { formatValue, runJsTests } from './js-core.ts'
import { runSqlTests } from './sql-core.ts'
import type { RunResult } from './types.ts'

const TIMEOUT_MS = 10_000

function withTimeout(run: Promise<RunResult>, tests: Challenge['tests']): Promise<RunResult> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<RunResult>((resolve) => {
    timer = setTimeout(
      () => resolve({ tests: tests.map((t) => ({ text: t.text, passed: false })), logs: [], error: 'Timed out' }),
      TIMEOUT_MS,
    )
  })
  return Promise.race([run, timeout]).finally(() => clearTimeout(timer))
}

async function runWeb(challenge: Challenge, files: CodeFile[]): Promise<RunResult> {
  const logs: string[] = []
  const virtualConsole = new VirtualConsole()
  for (const level of ['log', 'info', 'warn', 'error'] as const) {
    virtualConsole.on(level, (...args: unknown[]) => logs.push(args.map(formatValue).join(' ')))
  }
  virtualConsole.on('jsdomError', (error: Error) => logs.push(`Error: ${error.message}`))
  const dom = new JSDOM(buildDocument(files), { runScripts: 'dangerously', virtualConsole })
  try {
    const result = await runJsTests({
      code: '',
      rawCode: files.map((f) => f.contents).join('\n'),
      setup: '',
      tests: challenge.tests,
      globals: { document: dom.window.document, window: dom.window },
    })
    return { ...result, logs: [...logs, ...result.logs] }
  } finally {
    dom.window.close()
  }
}

/**
 * Runs a challenge's tests against the given files in Node. Used by `npm run validate` to prove every
 * reference solution passes and every seed fails. Content is trusted here, so learner code is not isolated
 * beyond a timeout (a synchronous infinite loop would still hang).
 */
export function runChallengeInNode(challenge: Challenge, files: CodeFile[]): Promise<RunResult> {
  switch (challenge.type) {
    case 'code-js':
    case 'code-ts':
      return withTimeout(runJsTests(jsInput(challenge, files)), challenge.tests)
    case 'sql':
      return withTimeout(runSqlTests(sqlInput(challenge, files)), challenge.tests)
    case 'web':
      return withTimeout(runWeb(challenge, files), challenge.tests)
    default:
      throw new Error(`"${challenge.type}" challenges have no automatic tests`)
  }
}
