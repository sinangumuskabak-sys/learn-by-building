import { runJsTests, type JsRunInput } from './js-core.ts'

// Runs learner JavaScript off the main thread; the page terminates this worker on timeout.
self.onmessage = async (event: MessageEvent<JsRunInput>) => {
  self.postMessage(await runJsTests(event.data))
}
