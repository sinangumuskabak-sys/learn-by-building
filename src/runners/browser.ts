import type { Challenge, CodeFile } from '../content/schema.ts'
import { jsInput, sqlInput } from './challenge-input.ts'
import { previewDocument } from './web-document.ts'
import harness from 'virtual:web-harness'
import { formatValue, type JsRunInput } from './js-core.ts'
import type { RunResult } from './types.ts'

export const RUN_TIMEOUT_MS = 5_000

function failAll(challenge: Challenge, error: string): RunResult {
  return { tests: challenge.tests.map((t) => ({ text: t.text, passed: false })), logs: [], error }
}

/** Runs JS in a throwaway worker so infinite loops can be stopped by terminating it. */
function runJsInWorker(challenge: Challenge, input: JsRunInput): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' })
    const timer = setTimeout(() => {
      worker.terminate()
      resolve(failAll(challenge, `Timed out after ${RUN_TIMEOUT_MS / 1000}s — is there an infinite loop?`))
    }, RUN_TIMEOUT_MS)
    const finish = (result: RunResult) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(result)
    }
    worker.onmessage = (event: MessageEvent<RunResult>) => finish(event.data)
    worker.onerror = (event) => {
      event.preventDefault()
      finish(failAll(challenge, event.message || 'The code could not run'))
    }
    worker.postMessage(input)
  })
}

/**
 * Loads a web challenge into the given iframe and runs the tests against its document. The iframe is sandboxed without
 * the site's origin (`sandbox="allow-scripts"`), so the learner's page cannot reach the site's storage; the tests run
 * inside it (see web-harness.ts) and post their result back.
 */
export async function runWebInIframe(
  iframe: HTMLIFrameElement,
  challenge: Challenge,
  files: CodeFile[],
): Promise<RunResult> {
  const logs: string[] = []
  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve()
    iframe.srcdoc = previewDocument(files).replace(
      /<head>/i,
      // Forward the page's console and uncaught errors to the parent before learner scripts run.
      `<head><script>for (const k of ['log','info','warn','error']) { const o = console[k]; console[k] = (...a) => { parent.postMessage({ __lpLog: a.map(String).join(' ') }, '*'); o(...a) } }
window.addEventListener('error', (e) => parent.postMessage({ __lpLog: 'Error: ' + e.message }, '*'))</script><script>${harness.replace(/<\/script/gi, '<\\/script')}</script>`,
    )
  })
  const onMessage = (event: MessageEvent) => {
    if (event.source === iframe.contentWindow && typeof event.data?.__lpLog === 'string') logs.push(event.data.__lpLog)
  }
  window.addEventListener('message', onMessage)
  try {
    const win = iframe.contentWindow
    if (!win) return failAll(challenge, 'Preview is not available')
    const id = Math.random().toString(36).slice(2)
    const result = await new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        window.removeEventListener('message', onResult)
        resolve(failAll(challenge, `Timed out after ${RUN_TIMEOUT_MS / 1000}s — is there an infinite loop?`))
      }, RUN_TIMEOUT_MS)
      const onResult = (event: MessageEvent) => {
        const data = event.data as { __lpResult?: string; result?: RunResult } | null
        if (event.source !== win || data?.__lpResult !== id || !data.result) return
        clearTimeout(timer)
        window.removeEventListener('message', onResult)
        resolve(data.result)
      }
      window.addEventListener('message', onResult)
      const input: Omit<JsRunInput, 'globals'> = { code: '', rawCode: files.map((f) => f.contents).join('\n'), setup: '', tests: challenge.tests }
      win.postMessage({ __lpRun: id, input }, '*')
    })
    // Let queued console messages from the iframe arrive before reporting.
    await new Promise((r) => setTimeout(r, 0))
    return { ...result, logs: [...logs.map(formatValue), ...result.logs] }
  } finally {
    window.removeEventListener('message', onMessage)
  }
}

/** Runs a JS, TS or SQL challenge in the browser. Web challenges use `runWebInIframe`. */
export async function runChallenge(challenge: Challenge, files: CodeFile[]): Promise<RunResult> {
  try {
    switch (challenge.type) {
      case 'code-js':
      case 'code-ts':
        return await runJsInWorker(challenge, jsInput(challenge, files))
      case 'sql': {
        const { runSqlTests } = await import('./sql-core.ts')
        return await runSqlTests(sqlInput(challenge, files))
      }
      default:
        throw new Error(`"${challenge.type}" challenges are not run by runChallenge`)
    }
  } catch (error) {
    return failAll(challenge, error instanceof Error ? error.message : String(error))
  }
}
