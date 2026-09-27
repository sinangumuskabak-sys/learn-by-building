import type { RunResult } from '../runners/types.ts'
import type { GameRunInput } from './run.ts'

export const GAME_TIMEOUT_MS = 5_000

/** Runs a step's tests in a throwaway worker so a stuck loop can be stopped. */
export function runGameInWorker(input: GameRunInput): Promise<RunResult> {
  const failAll = (error: string): RunResult => ({
    tests: input.tests.map((t) => ({ text: t.text, passed: false })),
    logs: [],
    error,
  })
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./game.worker.ts', import.meta.url), { type: 'module' })
    const finish = (result: RunResult) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(result)
    }
    const timer = setTimeout(
      () => finish(failAll(`Timed out after ${GAME_TIMEOUT_MS / 1000}s — is there an infinite loop?`)),
      GAME_TIMEOUT_MS,
    )
    worker.onmessage = (event: MessageEvent<RunResult>) => finish(event.data)
    worker.onerror = (event) => {
      event.preventDefault()
      finish(failAll(event.message || 'The code could not run'))
    }
    worker.postMessage(input)
  })
}
