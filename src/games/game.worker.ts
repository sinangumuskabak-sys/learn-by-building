import { runGameTests, type GameRunInput } from './run.ts'

// Runs game tests off the main thread; the page terminates this worker on timeout (infinite loops).
self.onmessage = (event: MessageEvent<GameRunInput>) => {
  self.postMessage(runGameTests(event.data))
}
